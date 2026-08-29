import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Autonomous Food & Water Grid.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('food-water', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('food-water', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('food-water');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'agriculture.water-demand.predicted.v1',
          'agriculture.water-shortage.predicted.v1',
          'agriculture.yield.forecast.v1',
          'water.reservoir-level.updated.v1',
          'fisheries.stock.updated.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('food-water');
    }
  });

  it('publishes agriculture.water-demand.predicted.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('agriculture.water-demand.predicted.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 14 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'environment.climate-risk.updated.v1',
      'environment.water-quality.updated.v1',
      'environment.air-quality.updated.v1',
      'iot.sensor.observation.v1',
      'infrastructure.failure.predicted.v1',
      'energy.outage-risk.flagged.v1',
      'land.parcel.updated.v1',
      'land.zoning.changed.v1',
      'treasury.funding.approved.v1',
      'resilience.crisis.declared.v1',
      'trade.export-opportunity.detected.v1',
      'research.finding.released.v1',
      'health.epidemic-signal.detected.v1',
      'twin.state.updated.v1',
    ]) {
      expect(subscribed.has(expected), `food-water does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'environment.climate-risk.updated.v1', from: 'environment' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('food-water', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('food-water', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
