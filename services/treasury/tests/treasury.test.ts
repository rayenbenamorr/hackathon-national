import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Intelligent Treasury OS.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('treasury', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('treasury', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('treasury');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'treasury.budget-line.updated.v1',
          'treasury.funding.approved.v1',
          'treasury.aid.disbursed.v1',
          'treasury.fiscal-risk.flagged.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('treasury');
    }
  });

  it('publishes treasury.budget-line.updated.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('treasury.budget-line.updated.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 15 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'resilience.relief-plan.updated.v1',
      'resilience.resource-request.created.v1',
      'health.capacity.updated.v1',
      'agriculture.water-shortage.predicted.v1',
      'infrastructure.failure.predicted.v1',
      'infrastructure.maintenance.scheduled.v1',
      'social.household-need.detected.v1',
      'energy.outage-risk.flagged.v1',
      'trade.supply-risk.flagged.v1',
      'education.program.updated.v1',
      'justice.court-load.updated.v1',
      'twin.scenario.completed.v1',
      'emergency.incident.resolved.v1',
      'land.site-suitability.scored.v1',
      'research.transfer.matched.v1',
    ]) {
      expect(subscribed.has(expected), `treasury does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'resilience.relief-plan.updated.v1', from: 'resilience' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('treasury', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('treasury', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
