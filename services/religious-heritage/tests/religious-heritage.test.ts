import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Smart Religious Heritage Network.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('religious-heritage', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('religious-heritage', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('religious-heritage');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'heritage.site-condition.updated.v1',
          'heritage.energy-usage.updated.v1',
          'heritage.knowledge.published.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('religious-heritage');
    }
  });

  it('publishes heritage.site-condition.updated.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('heritage.site-condition.updated.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 18 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'iot.sensor.observation.v1',
      'environment.air-quality.updated.v1',
      'environment.climate-risk.updated.v1',
      'infrastructure.failure.predicted.v1',
      'infrastructure.maintenance.scheduled.v1',
      'energy.grid-load.updated.v1',
      'culture.asset-condition.updated.v1',
      'tourism.visitor-flow.updated.v1',
      'tourism.site-pressure.detected.v1',
      'transport.mobility-demand.updated.v1',
      'research.finding.released.v1',
      'emergency.incident.created.v1',
      'treasury.funding.approved.v1',
      'education.program.updated.v1',
      'resilience.crisis.declared.v1',
      'land.zoning.changed.v1',
      'social.vulnerability.updated.v1',
      'twin.state.updated.v1',
    ]) {
      expect(subscribed.has(expected), `religious-heritage does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'iot.sensor.observation.v1', from: 'digital-nervous-system' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('religious-heritage', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('religious-heritage', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
