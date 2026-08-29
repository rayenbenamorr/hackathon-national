import { describe, expect, it, beforeEach } from 'vitest';
import { z } from 'zod';
import { buildEnvelope, EventBus, MemoryTransport, setEventValidator, versionOf } from '@platform/events';

describe('event envelope', () => {
  it('carries the nine mandated fields (§8)', () => {
    const envelope = buildEnvelope('environment.air-quality.updated.v1', 'environment', { pm25: 31 });
    for (const field of [
      'eventId',
      'eventType',
      'version',
      'timestamp',
      'sourceService',
      'correlationId',
      'traceId',
      'payload',
      'metadata',
    ]) {
      expect(envelope, `missing ${field}`).toHaveProperty(field);
    }
    expect(envelope.version).toBe(1);
    expect(envelope.metadata.synthetic).toBe(true);
  });

  it('derives the version from the type suffix', () => {
    expect(versionOf('a.b.c.v1')).toBe(1);
    expect(versionOf('a.b.c.v7')).toBe(7);
  });

  it('propagates a trace across a causal chain', () => {
    const first = buildEnvelope('a.b.c.v1', 'x', {});
    const second = buildEnvelope('d.e.f.v1', 'y', {}, { traceId: first.traceId, causationId: first.eventId });
    expect(second.traceId).toBe(first.traceId);
    expect(second.metadata.causationId).toBe(first.eventId);
  });
});

describe('event bus', () => {
  let bus: EventBus;

  beforeEach(() => {
    setEventValidator(() => ({ ok: true }));
    bus = new EventBus(new MemoryTransport());
  });

  it('delivers to every subscriber before publish resolves', async () => {
    const seen: string[] = [];
    for (const service of ['health', 'treasury', 'environment', 'land', 'tourism', 'culture', 'justice']) {
      bus.subscribe({
        eventType: 'x.y.z.v1',
        subscriberService: service,
        handler: () => void seen.push(service),
      });
    }
    await bus.publish('x.y.z.v1', 'food-water', {});
    // The bug this test exists for: delivery used to stop after the consumers
    // that happened to run in the first microtask.
    expect(seen).toHaveLength(7);
  });

  it('isolates a failing consumer from the rest (§28)', async () => {
    const seen: string[] = [];
    bus.subscribe({
      eventType: 'x.y.z.v1',
      subscriberService: 'broken',
      handler: () => {
        throw new Error('boom');
      },
    });
    bus.subscribe({
      eventType: 'x.y.z.v1',
      subscriberService: 'fine',
      handler: () => void seen.push('fine'),
    });

    await expect(bus.publish('x.y.z.v1', 'source', {})).resolves.toBeDefined();
    expect(seen).toEqual(['fine']);
    expect(bus.stats().failed).toBe(1);
  });

  it('refuses an event that breaks its contract and dead-letters it', async () => {
    setEventValidator((envelope) => {
      const parsed = z.object({ value: z.number() }).safeParse(envelope.payload);
      return parsed.success ? { ok: true } : { ok: false, problems: ['payload.value: expected number'] };
    });
    const strict = new EventBus(new MemoryTransport());

    await expect(strict.publish('x.y.z.v1', 'source', { value: 'nope' })).rejects.toThrow(
      /does not match its contract/,
    );
    expect(strict.deadLetterQueue()).toHaveLength(1);
  });

  it('lets an observer subscribe to everything without becoming a consumer', async () => {
    const observed: string[] = [];
    bus.subscribe({
      eventType: '*',
      subscriberService: 'gateway',
      handler: (e) => void observed.push(e.eventType),
    });
    await bus.publish('a.b.c.v1', 'source', {});
    expect(observed).toEqual(['a.b.c.v1']);
    expect(bus.domainSubscribers('a.b.c.v1')).toHaveLength(0);
  });
});
