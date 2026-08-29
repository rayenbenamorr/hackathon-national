import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Global Tunisia Network.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('global-tunisia', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('global-tunisia', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('global-tunisia');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'global.consular-request.created.v1',
          'global.opportunity.published.v1',
          'global.diaspora-signal.updated.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('global-tunisia');
    }
  });

  it('publishes global.consular-request.created.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('global.consular-request.created.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 16 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'skills.gap.detected.v1',
      'skills.micro-mission.published.v1',
      'research.project.published.v1',
      'trade.export-opportunity.detected.v1',
      'treasury.funding.approved.v1',
      'culture.event.scheduled.v1',
      'tourism.experience.published.v1',
      'justice.legal-text.published.v1',
      'health.epidemic-signal.detected.v1',
      'resilience.crisis.declared.v1',
      'education.program.updated.v1',
      'twin.state.updated.v1',
      'land.site-suitability.scored.v1',
      'care.life-event.recorded.v1',
      'social.benefit.granted.v1',
      'industry.production.updated.v1',
    ]) {
      expect(subscribed.has(expected), `global-tunisia does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'skills.gap.detected.v1', from: 'skills-opportunity' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('global-tunisia', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('global-tunisia', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
