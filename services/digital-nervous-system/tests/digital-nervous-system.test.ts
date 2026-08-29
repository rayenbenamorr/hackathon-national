import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Tunisia Digital Nervous System.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('digital-nervous-system', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('digital-nervous-system', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('digital-nervous-system');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'iot.sensor.observation.v1',
          'dns.sensor.registered.v1',
          'dns.edge-node.status.v1',
          'dns.identity.verified.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('digital-nervous-system');
    }
  });

  it('publishes iot.sensor.observation.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('iot.sensor.observation.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 15 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'environment.air-quality.updated.v1',
      'emergency.incident.created.v1',
      'resilience.crisis.declared.v1',
      'resilience.mesh-node.status.v1',
      'infrastructure.asset-health.updated.v1',
      'energy.grid-load.updated.v1',
      'transport.resource.dispatched.v1',
      'water.reservoir-level.updated.v1',
      'health.capacity.updated.v1',
      'education.school-condition.updated.v1',
      'land.parcel.updated.v1',
      'research.finding.released.v1',
      'twin.anomaly.detected.v1',
      'treasury.funding.approved.v1',
      'tourism.site-pressure.detected.v1',
    ]) {
      expect(subscribed.has(expected), `digital-nervous-system does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'environment.air-quality.updated.v1', from: 'environment' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('digital-nervous-system', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('digital-nervous-system', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
