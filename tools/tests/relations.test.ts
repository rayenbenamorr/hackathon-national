import { describe, expect, it, beforeAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { ARCHITECTURE_RELATIONS, MINIMUM_PARTNERS, partnersOf, SERVICE_DIRECTORY } from '@platform/contracts';
import { eventContract } from '@platform/contracts';

/**
 * RELATION TESTING (§24).
 *
 * The example in the brief, generalised: a producer publishes, and every
 * consumer the architecture declares must be able to deserialise and process
 * it. Run for EVERY critical relation on the platform, not one.
 */
let platform: TestPlatform;

beforeAll(async () => {
  platform = await startTestPlatform();
}, 120_000);

const criticalEvents = [
  ...new Set(
    ARCHITECTURE_RELATIONS.filter((r) => r.kind === 'event' && r.criticality === 'critical').map(
      (r) => r.ref,
    ),
  ),
];

describe('connectivity', () => {
  it(`connects every ministry to at least ${MINIMUM_PARTNERS} others (§2)`, () => {
    const below = Object.keys(SERVICE_DIRECTORY)
      .map((id) => ({ id, partners: partnersOf(id).length }))
      .filter((row) => row.partners < MINIMUM_PARTNERS);
    expect(below, `below the connectivity target: ${JSON.stringify(below)}`).toEqual([]);
  });

  it('has no service that talks only to itself', () => {
    for (const id of Object.keys(SERVICE_DIRECTORY)) {
      expect(partnersOf(id).length, `${id} is an island`).toBeGreaterThan(0);
    }
  });
});

describe('critical event relations actually work end to end', () => {
  it(`covers ${criticalEvents.length} critical event types`, () => {
    expect(criticalEvents.length).toBeGreaterThan(20);
  });

  for (const eventType of criticalEvents) {
    const contract = eventContract(eventType)!;
    const expectedConsumers = ARCHITECTURE_RELATIONS.filter(
      (r) => r.kind === 'event' && r.ref === eventType && r.criticality === 'critical',
    ).map((r) => r.target);

    it(`${eventType} reaches ${expectedConsumers.length} critical consumer(s)`, async () => {
      await platform.publish(contract.owner, eventType);

      const delivered = platform.deliveriesOf(eventType);
      for (const consumer of expectedConsumers) {
        const hit = delivered.find((d) => d.to === consumer);
        expect(hit, `${consumer} never received ${eventType}`).toBeDefined();
        expect(hit!.ok, `${consumer} threw while handling ${eventType}`).toBe(true);
      }
    });

    it(`${eventType} lands in each consumer's signals`, async () => {
      await platform.publish(contract.owner, eventType);
      for (const consumer of expectedConsumers.slice(0, 3)) {
        const response = await platform.get(consumer, '/signals', { eventType, limit: '5' });
        const items = (response.body as { items: Array<{ eventType: string }> }).items;
        expect(
          items.some((item) => item.eventType === eventType),
          `${consumer} did not store ${eventType}`,
        ).toBe(true);
      }
    });
  }
});

describe('API relations', () => {
  const apiRelations = ARCHITECTURE_RELATIONS.filter((r) => r.kind === 'api');

  it(`declares ${apiRelations.length} synchronous dependencies, all reachable`, async () => {
    const broken: string[] = [];
    for (const relation of apiRelations) {
      const response = await platform.get(relation.target, '/dependencies');
      const items = (
        response.body as { items: Array<{ service: string; route: string; reachable: boolean }> }
      ).items;
      const match = items.find((item) => item.service === relation.source && item.route === relation.ref);
      if (!match) broken.push(`${relation.target} does not declare ${relation.source} ${relation.ref}`);
      else if (!match.reachable) broken.push(`${relation.target} cannot reach ${relation.source}`);
    }
    expect(broken).toEqual([]);
  });
});
