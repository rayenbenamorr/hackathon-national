import type { EventEnvelope } from '@platform/events';
import type { SensorObservation } from '@platform/refs';
import type { ServiceContext } from './types.ts';

/**
 * SIGNALS — what the other 23 ministries have told this one.
 *
 * Every generated consumer starts by calling `rememberSignal`. That single line
 * is why a student who has written no integration code at all still opens
 * `GET /api/<service>/signals` on the first morning and sees eleven other
 * ministries talking to theirs. The reaction they write afterwards is the
 * lesson; the plumbing is not.
 *
 * A signal is a COPY OF A NOTIFICATION, not a copy of another service database:
 * it holds the envelope this service was sent, nothing it was not sent.
 */
export interface Signal {
  id: string;
  eventType: string;
  from: string;
  receivedAt: string;
  traceId: string;
  governorate?: string;
  payload: unknown;
}

const MAX_SIGNALS = 400;
const COLLECTION = 'signals';

export function rememberSignal(ctx: ServiceContext, envelope: EventEnvelope): Signal {
  const signals = ctx.db.collection<Signal>(COLLECTION);

  const payload = (envelope.payload ?? {}) as Record<string, unknown>;
  const signal: Signal = {
    id: envelope.eventId,
    eventType: envelope.eventType,
    from: envelope.sourceService,
    receivedAt: new Date().toISOString(),
    traceId: envelope.traceId,
    governorate: typeof payload.governorate === 'string' ? payload.governorate : undefined,
    payload: envelope.payload,
  };
  signals.upsert(signal);

  // Bounded: a six-day hackathon should never fill a laptop disk.
  const all = signals.list({ sort: { key: 'receivedAt', direction: 'asc' } });
  if (all.length > MAX_SIGNALS) {
    for (const old of all.slice(0, all.length - MAX_SIGNALS)) signals.delete(old.id);
  }
  return signal;
}

export function readSignals(
  ctx: ServiceContext,
  filter: { eventType?: string; from?: string; governorate?: string; limit?: number } = {},
): Signal[] {
  return ctx.db.collection<Signal>(COLLECTION).list({
    match: (s) =>
      (!filter.eventType || s.eventType === filter.eventType) &&
      (!filter.from || s.from === filter.from) &&
      (!filter.governorate || s.governorate === filter.governorate),
    sort: { key: 'receivedAt', direction: 'desc' },
    limit: filter.limit ?? 50,
  });
}

export function latestSignal(
  ctx: ServiceContext,
  eventType: string,
  governorate?: string,
): Signal | undefined {
  return readSignals(ctx, { eventType, governorate, limit: 1 })[0];
}

/** Which ministries have actually reached this one. Used in event payloads. */
export function signalSources(ctx: ServiceContext, limit = 6): string[] {
  const seen = new Set<string>();
  for (const signal of readSignals(ctx, { limit: 200 })) seen.add(signal.from);
  return [...seen].slice(0, limit);
}

/**
 * The IoT → twin bridge.
 *
 * A sensor observation arrives from the Digital Nervous System with a location.
 * Every twin this service owns in the same governorate gets the reading applied
 * to its state. Crude on purpose — a student replaces "same governorate" with
 * "within 5 km of the asset" and has learned something real about geospatial
 * joins in one edit.
 */
export function applyObservationToTwins(
  ctx: ServiceContext,
  envelope: EventEnvelope,
  options: { kinds?: string[]; maxTwins?: number } = {},
): number {
  const observation = envelope.payload as Partial<SensorObservation> & { governorate?: string };
  if (!observation?.sensorKind || typeof observation.value !== 'number') return 0;
  if (options.kinds && !options.kinds.includes(observation.sensorKind)) return 0;

  const governorate = observation.governorate ?? observation.location?.governorate;
  const twins = ctx.twins.list({ governorate, limit: options.maxTwins ?? 5 });

  for (const twin of twins) {
    ctx.twins.applyObservation(twin.id, {
      metric: observation.sensorKind,
      value: observation.value,
      unit: observation.unit ?? '',
      at: observation.observedAt ?? new Date().toISOString(),
      sensorId: observation.sensorId,
      quality: observation.quality ?? 'good',
    });
  }
  return twins.length;
}
