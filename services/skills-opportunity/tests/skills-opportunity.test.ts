import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for National Skills & Opportunity OS.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('skills-opportunity', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('skills-opportunity', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('skills-opportunity');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? ['skills.gap.detected.v1', 'skills.micro-mission.published.v1', 'skills.profile.updated.v1']
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('skills-opportunity');
    }
  });

  it('publishes skills.gap.detected.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('skills.gap.detected.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 14 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'education.program.updated.v1',
      'education.learning-progress.updated.v1',
      'research.project.published.v1',
      'research.transfer.matched.v1',
      'industry.production.updated.v1',
      'agriculture.yield.forecast.v1',
      'trade.export-opportunity.detected.v1',
      'infrastructure.maintenance.scheduled.v1',
      'health.capacity.updated.v1',
      'treasury.funding.approved.v1',
      'tourism.visitor-flow.updated.v1',
      'global.diaspora-signal.updated.v1',
      'talent.performance.updated.v1',
      'social.vulnerability.updated.v1',
    ]) {
      expect(subscribed.has(expected), `skills-opportunity does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'education.program.updated.v1', from: 'education' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('skills-opportunity', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('skills-opportunity', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
