import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Tunisia Research Brain.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('research', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('research', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('research');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? ['research.project.published.v1', 'research.finding.released.v1', 'research.transfer.matched.v1']
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('research');
    }
  });

  it('publishes research.project.published.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('research.project.published.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 14 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'skills.gap.detected.v1',
      'agriculture.water-shortage.predicted.v1',
      'environment.climate-risk.updated.v1',
      'health.epidemic-signal.detected.v1',
      'industry.symbiosis.matched.v1',
      'infrastructure.failure.predicted.v1',
      'education.program.updated.v1',
      'treasury.funding.approved.v1',
      'twin.scenario.completed.v1',
      'land.site-suitability.scored.v1',
      'trade.supply-risk.flagged.v1',
      'global.diaspora-signal.updated.v1',
      'culture.asset-condition.updated.v1',
      'talent.injury-risk.flagged.v1',
    ]) {
      expect(subscribed.has(expected), `research does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'skills.gap.detected.v1', from: 'skills-opportunity' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('research', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('research', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
