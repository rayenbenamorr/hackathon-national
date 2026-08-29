import { z } from 'zod';
import { newCorrelationId, newEventId, newTraceId } from '@platform/observability';

/**
 * THE EVENT ENVELOPE (§8).
 *
 * Every event on the national bus has exactly this shape. The nine fields are
 * not decoration: `traceId` is what lets the student portal draw
 *
 *     food-water → environment → national-digital-twin → treasury
 *
 * as one picture instead of four unrelated log lines.
 */
export const EventEnvelope = z.object({
  eventId: z.string(),
  eventType: z
    .string()
    .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+\.v\d+$/, 'Event types look like domain.thing.verb.v1'),
  version: z.number().int().positive(),
  timestamp: z.string().datetime(),
  sourceService: z.string(),
  correlationId: z.string(),
  traceId: z.string(),
  payload: z.unknown(),
  metadata: z
    .object({
      /** Set when this event was produced while handling another one. */
      causationId: z.string().optional(),
      /** Free-form, but never sensitive: the logger redacts, the bus does not. */
      tags: z.array(z.string()).optional(),
      synthetic: z.boolean().default(true),
      producedBy: z.string().optional(),
      governorate: z.string().optional(),
    })
    .catchall(z.unknown())
    .default({ synthetic: true }),
});

export type EventEnvelope<P = unknown> = Omit<z.infer<typeof EventEnvelope>, 'payload'> & { payload: P };

export interface PublishOptions {
  traceId?: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, unknown>;
}

/** The version number is derived from the `.vN` suffix — one source of truth. */
export function versionOf(eventType: string): number {
  const match = /\.v(\d+)$/.exec(eventType);
  return match ? Number(match[1]) : 1;
}

export function buildEnvelope<P>(
  eventType: string,
  sourceService: string,
  payload: P,
  options: PublishOptions = {},
): EventEnvelope<P> {
  return {
    eventId: newEventId(),
    eventType,
    version: versionOf(eventType),
    timestamp: new Date().toISOString(),
    sourceService,
    correlationId: options.correlationId ?? newCorrelationId(),
    traceId: options.traceId ?? newTraceId(),
    payload,
    metadata: {
      synthetic: true,
      producedBy: sourceService,
      ...(options.causationId ? { causationId: options.causationId } : {}),
      ...options.metadata,
    },
  };
}
