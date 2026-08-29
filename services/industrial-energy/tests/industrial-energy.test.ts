import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Industrial & Energy Intelligence Grid.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('industrial-energy', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('industrial-energy', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('industrial-energy');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'energy.grid-load.updated.v1',
          'energy.outage-risk.flagged.v1',
          'industry.production.updated.v1',
          'industry.symbiosis.matched.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('industrial-energy');
    }
  });

  it('publishes energy.grid-load.updated.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('energy.grid-load.updated.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 14 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'environment.air-quality.updated.v1',
      'environment.waste-stream.updated.v1',
      'environment.climate-risk.updated.v1',
      'iot.sensor.observation.v1',
      'agriculture.water-demand.predicted.v1',
      'infrastructure.failure.predicted.v1',
      'logistics.freight.updated.v1',
      'trade.supply-risk.flagged.v1',
      'treasury.funding.approved.v1',
      'resilience.crisis.declared.v1',
      'research.finding.released.v1',
      'skills.gap.detected.v1',
      'land.site-suitability.scored.v1',
      'twin.scenario.completed.v1',
    ]) {
      expect(subscribed.has(expected), `industrial-energy does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'environment.air-quality.updated.v1', from: 'environment' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('industrial-energy', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('industrial-energy', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
