import { buildEnvelope, type EventEnvelope, type PublishOptions } from './envelope.ts';
import { createTransport, type EventTransport } from './transport.ts';
import { createLogger, recordHop, type Logger } from '@platform/observability';

export interface Subscription {
  id: string;
  eventType: string;
  subscriberService: string;
  description?: string;
  handler: (envelope: EventEnvelope) => void | Promise<void>;
}

export interface DeliveryRecord {
  ts: string;
  eventId: string;
  eventType: string;
  from: string;
  to: string;
  ok: boolean;
  durationMs: number;
  error?: string;
}

/**
 * Validation is INJECTED rather than imported.
 *
 * `@platform/contracts` owns the schemas and depends on the envelope; if the
 * bus imported the contracts back, the two packages would be a cycle. So the
 * contracts package calls `setEventValidator()` at load time and the bus stays
 * a dumb, dependency-light pipe.
 */
export type EventValidator = (envelope: EventEnvelope) => { ok: true } | { ok: false; problems: string[] };

let validator: EventValidator = () => ({ ok: true });
export function setEventValidator(next: EventValidator): void {
  validator = next;
}

const MAX_RECENT = 500;

export class EventBus {
  private readonly subscriptions: Subscription[] = [];
  private readonly recent: EventEnvelope[] = [];
  private readonly deliveries: DeliveryRecord[] = [];
  private readonly deadLetters: Array<{ envelope: EventEnvelope; reason: string; ts: string }> = [];
  private readonly log: Logger = createLogger({ service: 'event-bus' });
  private transport: EventTransport;
  private started = false;
  private seq = 0;

  constructor(transport: EventTransport = createTransport()) {
    this.transport = transport;
    // Returning the promise (rather than discarding it) is what makes
    // `await publish()` mean "every consumer has run".
    this.transport.onMessage((envelope) => this.deliver(envelope));
  }

  get transportName(): string {
    return this.transport.name;
  }

  async start(): Promise<void> {
    if (this.started) return;
    await this.transport.start();
    this.started = true;
    this.log.info(`event bus ready (transport: ${this.transport.name})`);
  }

  async stop(): Promise<void> {
    await this.transport.stop();
    this.started = false;
  }

  subscribe(sub: Omit<Subscription, 'id'>): () => void {
    const id = `sub_${++this.seq}`;
    this.subscriptions.push({ id, ...sub });
    return () => {
      const index = this.subscriptions.findIndex((s) => s.id === id);
      if (index >= 0) this.subscriptions.splice(index, 1);
    };
  }

  /**
   * `'*'` subscribers receive everything. Only the gateway uses it, to stream
   * the live event feed into the student portal — a ministry service must
   * declare the events it consumes, so it never gets the wildcard.
   */
  subscribers(eventType: string): Subscription[] {
    return this.subscriptions.filter((s) => s.eventType === eventType || s.eventType === '*');
  }

  /** Real domain consumers, excluding observers. Used to detect a dead end. */
  domainSubscribers(eventType: string): Subscription[] {
    return this.subscriptions.filter((s) => s.eventType === eventType);
  }

  allSubscriptions(): Array<Omit<Subscription, 'handler'>> {
    return this.subscriptions.map(({ handler: _handler, ...rest }) => rest);
  }

  /** Publish a fully-built envelope (used by the SDK and by replay tools). */
  async publishEnvelope(envelope: EventEnvelope): Promise<EventEnvelope> {
    const verdict = validator(envelope);
    if (!verdict.ok) {
      this.deadLetters.push({
        envelope,
        reason: `contract violation: ${verdict.problems.join('; ')}`,
        ts: new Date().toISOString(),
      });
      // Loud, specific, and it names the file to open. A beginner can act on this.
      this.log.error(
        `Event "${envelope.eventType}" from ${envelope.sourceService} does NOT match its contract and was not delivered.`,
        {
          problems: verdict.problems,
          hint: `see packages/contracts/src/events/${envelope.sourceService}.ts`,
        },
      );
      throw new EventContractError(envelope.eventType, verdict.problems);
    }

    this.recent.push(envelope);
    if (this.recent.length > MAX_RECENT) this.recent.splice(0, this.recent.length - MAX_RECENT);

    await this.transport.publish(envelope);
    return envelope;
  }

  async publish<P>(
    eventType: string,
    sourceService: string,
    payload: P,
    options: PublishOptions = {},
  ): Promise<EventEnvelope<P>> {
    const envelope = buildEnvelope(eventType, sourceService, payload, options);
    await this.publishEnvelope(envelope as EventEnvelope);
    return envelope;
  }

  private async deliver(envelope: EventEnvelope): Promise<void> {
    const targets = this.subscribers(envelope.eventType);

    if (this.domainSubscribers(envelope.eventType).length === 0) {
      // Not an error — a producer may legitimately run ahead of its consumers —
      // but the portal shows it so a student sees "nobody is listening yet".
      recordHop({
        traceId: envelope.traceId,
        correlationId: envelope.correlationId,
        kind: 'event',
        from: envelope.sourceService,
        to: '(no consumer)',
        label: envelope.eventType,
        ok: true,
      });
    }

    for (const sub of targets) {
      const started = Date.now();
      // A wildcard observer (the gateway's live feed) is not a domain consumer:
      // recording it would put "→ gateway" in every flow a student reads.
      const observer = sub.eventType === '*';
      try {
        await sub.handler(envelope);
        const durationMs = Date.now() - started;
        if (observer) continue;
        this.record({
          ts: new Date().toISOString(),
          eventId: envelope.eventId,
          eventType: envelope.eventType,
          from: envelope.sourceService,
          to: sub.subscriberService,
          ok: true,
          durationMs,
        });
        recordHop({
          traceId: envelope.traceId,
          correlationId: envelope.correlationId,
          kind: 'consume',
          from: envelope.sourceService,
          to: sub.subscriberService,
          label: envelope.eventType,
          durationMs,
          ok: true,
        });
      } catch (error) {
        // §28: one broken consumer must never take the platform down.
        const message = error instanceof Error ? error.message : String(error);
        this.record({
          ts: new Date().toISOString(),
          eventId: envelope.eventId,
          eventType: envelope.eventType,
          from: envelope.sourceService,
          to: sub.subscriberService,
          ok: false,
          durationMs: Date.now() - started,
          error: message,
        });
        recordHop({
          traceId: envelope.traceId,
          kind: 'error',
          from: envelope.sourceService,
          to: sub.subscriberService,
          label: envelope.eventType,
          ok: false,
          detail: { error: message },
        });
        this.log.error(`${sub.subscriberService} failed while handling ${envelope.eventType}: ${message}`, {
          service: sub.subscriberService,
          traceId: envelope.traceId,
        });
      }
    }
  }

  private record(record: DeliveryRecord): void {
    this.deliveries.push(record);
    if (this.deliveries.length > MAX_RECENT) this.deliveries.splice(0, this.deliveries.length - MAX_RECENT);
  }

  recentEvents(limit = 50, service?: string): EventEnvelope[] {
    const pool = service
      ? this.recent.filter(
          (e) =>
            e.sourceService === service ||
            this.subscribers(e.eventType).some((s) => s.subscriberService === service),
        )
      : this.recent;
    return pool.slice(-limit).reverse();
  }

  recentDeliveries(limit = 100, service?: string): DeliveryRecord[] {
    const pool = service
      ? this.deliveries.filter((d) => d.from === service || d.to === service)
      : this.deliveries;
    return pool.slice(-limit).reverse();
  }

  deadLetterQueue(): Array<{ envelope: EventEnvelope; reason: string; ts: string }> {
    return [...this.deadLetters].reverse();
  }

  stats(): {
    transport: string;
    subscriptions: number;
    published: number;
    delivered: number;
    failed: number;
  } {
    return {
      transport: this.transport.name,
      subscriptions: this.subscriptions.length,
      published: this.recent.length,
      delivered: this.deliveries.filter((d) => d.ok).length,
      failed: this.deliveries.filter((d) => !d.ok).length,
    };
  }

  reset(): void {
    this.subscriptions.length = 0;
    this.recent.length = 0;
    this.deliveries.length = 0;
    this.deadLetters.length = 0;
  }
}

export class EventContractError extends Error {
  readonly statusCode = 422;
  constructor(
    readonly eventType: string,
    readonly problems: string[],
  ) {
    super(`Event "${eventType}" does not match its contract: ${problems.join('; ')}`);
    this.name = 'EventContractError';
  }
}

/** The platform runs one bus. Tests build their own with `new EventBus(...)`. */
let singleton: EventBus | null = null;
export function eventBus(): EventBus {
  if (!singleton) singleton = new EventBus();
  return singleton;
}
export function setEventBus(bus: EventBus): void {
  singleton = bus;
}
