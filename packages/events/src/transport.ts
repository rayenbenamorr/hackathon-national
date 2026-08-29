import type { EventEnvelope } from './envelope.ts';

/**
 * Transports are the ONLY thing that changes between "one laptop" and "a real
 * cluster". The broker, the contracts, the consumers and all 24 services are
 * written against this three-method interface.
 */
export interface EventTransport {
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  publish(envelope: EventEnvelope): Promise<void>;
  onMessage(handler: (envelope: EventEnvelope) => void | Promise<void>): void;
}

/**
 * Default. In-process, ordered, zero installation.
 *
 * `publish()` AWAITS delivery to every consumer. That is a deliberate
 * difference from a production broker, and it is worth it here: it means
 * `await ctx.publish(…)` has finished travelling the country when it returns,
 * so a test, a smoke run and the trace a student reads are all deterministic.
 * The first version of this file did not await, and delivery silently stopped
 * after whichever consumers happened to run in the same microtask.
 */
export class MemoryTransport implements EventTransport {
  readonly name = 'memory';
  private handler: ((envelope: EventEnvelope) => void | Promise<void>) | null = null;

  async start(): Promise<void> {}
  async stop(): Promise<void> {
    this.handler = null;
  }

  async publish(envelope: EventEnvelope): Promise<void> {
    await this.handler?.(envelope);
  }

  onMessage(handler: (envelope: EventEnvelope) => void | Promise<void>): void {
    this.handler = handler;
  }
}

/**
 * NATS adapter — present, opt-in, unused by default (`EVENT_TRANSPORT=nats`).
 *
 * §29 says do not add infrastructure because it is fashionable. A broker for
 * 1 500 students on 1 500 laptops is exactly that. So the seam exists and the
 * code is honest about being off: it is loaded lazily and, if the optional
 * `nats` dependency is absent, it says so in one sentence instead of throwing a
 * module-resolution stack trace at a beginner.
 */
export class NatsTransport implements EventTransport {
  readonly name = 'nats';
  private connection: unknown = null;
  private handler: ((envelope: EventEnvelope) => void | Promise<void>) | null = null;
  private readonly subject: string;

  constructor(
    private readonly url = process.env.NATS_URL ?? 'nats://127.0.0.1:4222',
    subject = 'national.events',
  ) {
    this.subject = subject;
  }

  async start(): Promise<void> {
    let nats: { connect: (opts: { servers: string }) => Promise<unknown> };
    try {
      // Indirected through a variable so TypeScript does not try to resolve an
      // optional dependency that is deliberately absent from package.json.
      const optionalModule = 'nats';
      nats = (await import(/* @vite-ignore */ optionalModule)) as never;
    } catch {
      throw new Error(
        'EVENT_TRANSPORT=nats but the optional "nats" package is not installed.\n' +
          '  Fix:  pnpm add nats     — or set EVENT_TRANSPORT=memory in your .env (recommended for the hackathon).',
      );
    }
    this.connection = await nats.connect({ servers: this.url });
    const conn = this.connection as {
      subscribe: (s: string, o: { callback: (err: unknown, msg: { data: Uint8Array }) => void }) => void;
    };
    conn.subscribe(this.subject, {
      callback: (_err, msg) => {
        if (!this.handler) return;
        // Over a real broker, delivery is genuinely asynchronous: publish
        // returns before consumers run, and nothing can await them.
        void this.handler(JSON.parse(new TextDecoder().decode(msg.data)) as EventEnvelope);
      },
    });
  }

  async stop(): Promise<void> {
    await (this.connection as { drain?: () => Promise<void> } | null)?.drain?.();
    this.connection = null;
  }

  async publish(envelope: EventEnvelope): Promise<void> {
    const conn = this.connection as { publish: (s: string, d: Uint8Array) => void } | null;
    if (!conn) throw new Error('NATS transport is not started.');
    conn.publish(this.subject, new TextEncoder().encode(JSON.stringify(envelope)));
  }

  onMessage(handler: (envelope: EventEnvelope) => void): void {
    this.handler = handler;
  }
}

export function createTransport(name = process.env.EVENT_TRANSPORT ?? 'memory'): EventTransport {
  switch (name) {
    case 'nats':
      return new NatsTransport();
    case 'memory':
      return new MemoryTransport();
    default:
      throw new Error(`Unknown EVENT_TRANSPORT "${name}". Use "memory" (default) or "nats".`);
  }
}
