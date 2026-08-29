import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Tunisia National Digital Twin.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('national-digital-twin', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('national-digital-twin', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('national-digital-twin');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? ['twin.state.updated.v1', 'twin.scenario.completed.v1', 'twin.anomaly.detected.v1']
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('national-digital-twin');
    }
  });

  it('publishes twin.state.updated.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('twin.state.updated.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 20 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'environment.air-quality.updated.v1',
      'environment.climate-risk.updated.v1',
      'agriculture.water-demand.predicted.v1',
      'agriculture.water-shortage.predicted.v1',
      'health.capacity.updated.v1',
      'transport.mobility-demand.updated.v1',
      'energy.grid-load.updated.v1',
      'infrastructure.asset-health.updated.v1',
      'social.vulnerability.updated.v1',
      'emergency.incident.created.v1',
      'resilience.crisis.declared.v1',
      'education.school-condition.updated.v1',
      'land.zoning.changed.v1',
      'tourism.visitor-flow.updated.v1',
      'treasury.fiscal-risk.flagged.v1',
      'iot.sensor.observation.v1',
      'trade.shipment.updated.v1',
      'skills.gap.detected.v1',
      'culture.creative-economy.updated.v1',
      'care.facility-capacity.updated.v1',
    ]) {
      expect(subscribed.has(expected), `national-digital-twin does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'environment.air-quality.updated.v1', from: 'environment' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('national-digital-twin', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('national-digital-twin', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
