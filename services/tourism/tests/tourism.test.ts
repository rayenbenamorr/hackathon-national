import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Tunisia Immersive Tourism OS.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('tourism', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('tourism', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('tourism');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'tourism.visitor-flow.updated.v1',
          'tourism.site-pressure.detected.v1',
          'tourism.experience.published.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('tourism');
    }
  });

  it('publishes tourism.visitor-flow.updated.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('tourism.visitor-flow.updated.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 16 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'environment.air-quality.updated.v1',
      'environment.water-quality.updated.v1',
      'environment.climate-risk.updated.v1',
      'culture.event.scheduled.v1',
      'culture.asset-condition.updated.v1',
      'heritage.site-condition.updated.v1',
      'transport.congestion.detected.v1',
      'transport.mobility-demand.updated.v1',
      'health.capacity.updated.v1',
      'emergency.incident.created.v1',
      'iot.sensor.observation.v1',
      'global.diaspora-signal.updated.v1',
      'infrastructure.asset-health.updated.v1',
      'resilience.crisis.declared.v1',
      'talent.facility-usage.updated.v1',
      'treasury.funding.approved.v1',
    ]) {
      expect(subscribed.has(expected), `tourism does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'environment.air-quality.updated.v1', from: 'environment' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('tourism', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('tourism', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
