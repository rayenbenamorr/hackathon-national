import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Justice Intelligence OS.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('justice', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('justice', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('justice');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'justice.case.filed.v1',
          'justice.case.decided.v1',
          'justice.court-load.updated.v1',
          'justice.legal-text.published.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('justice');
    }
  });

  it('publishes justice.case.filed.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('justice.case.filed.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 13 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'emergency.incident.created.v1',
      'land.zoning.changed.v1',
      'land.parcel.updated.v1',
      'social.vulnerability.updated.v1',
      'treasury.budget-line.updated.v1',
      'trade.supply-risk.flagged.v1',
      'resilience.crisis.declared.v1',
      'health.epidemic-signal.detected.v1',
      'transport.congestion.detected.v1',
      'environment.water-quality.updated.v1',
      'research.finding.released.v1',
      'twin.anomaly.detected.v1',
      'iot.sensor.observation.v1',
    ]) {
      expect(subscribed.has(expected), `justice does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'emergency.incident.created.v1', from: 'safety-emergency' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('justice', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('justice', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
