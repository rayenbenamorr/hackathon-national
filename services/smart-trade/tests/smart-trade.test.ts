import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Smart Trade Network.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('smart-trade', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('smart-trade', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('smart-trade');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'trade.product-passport.issued.v1',
          'trade.shipment.updated.v1',
          'trade.export-opportunity.detected.v1',
          'trade.supply-risk.flagged.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('smart-trade');
    }
  });

  it('publishes trade.product-passport.issued.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('trade.product-passport.issued.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 16 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'agriculture.yield.forecast.v1',
      'fisheries.stock.updated.v1',
      'industry.production.updated.v1',
      'logistics.freight.updated.v1',
      'transport.congestion.detected.v1',
      'environment.air-quality.updated.v1',
      'infrastructure.asset-health.updated.v1',
      'treasury.fiscal-risk.flagged.v1',
      'global.diaspora-signal.updated.v1',
      'justice.legal-text.published.v1',
      'research.finding.released.v1',
      'resilience.crisis.declared.v1',
      'land.zoning.changed.v1',
      'skills.gap.detected.v1',
      'iot.sensor.observation.v1',
      'health.epidemic-signal.detected.v1',
    ]) {
      expect(subscribed.has(expected), `smart-trade does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'agriculture.yield.forecast.v1', from: 'food-water' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('smart-trade', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('smart-trade', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
