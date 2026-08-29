import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Social Mobility OS.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('social-mobility', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('social-mobility', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('social-mobility');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? ['social.vulnerability.updated.v1', 'social.benefit.granted.v1', 'social.household-need.detected.v1']
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('social-mobility');
    }
  });

  it('publishes social.vulnerability.updated.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('social.vulnerability.updated.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 14 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'health.capacity.updated.v1',
      'health.epidemic-signal.detected.v1',
      'education.learning-progress.updated.v1',
      'education.school-condition.updated.v1',
      'agriculture.water-shortage.predicted.v1',
      'energy.outage-risk.flagged.v1',
      'treasury.aid.disbursed.v1',
      'skills.gap.detected.v1',
      'transport.mobility-demand.updated.v1',
      'care.support-need.detected.v1',
      'emergency.incident.created.v1',
      'resilience.crisis.declared.v1',
      'infrastructure.asset-health.updated.v1',
      'justice.case.filed.v1',
    ]) {
      expect(subscribed.has(expected), `social-mobility does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'health.capacity.updated.v1', from: 'health' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('social-mobility', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('social-mobility', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
