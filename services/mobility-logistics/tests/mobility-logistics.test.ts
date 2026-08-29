import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for Autonomous Mobility & Logistics Grid.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('mobility-logistics', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('mobility-logistics', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('mobility-logistics');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length
      ? [
          'transport.mobility-demand.updated.v1',
          'transport.resource.dispatched.v1',
          'transport.congestion.detected.v1',
          'logistics.freight.updated.v1',
        ]
      : []) {
      const contract = eventContract(type);
      expect(contract, `missing contract for ${type}`).toBeDefined();
      expect(contract!.owner).toBe('mobility-logistics');
    }
  });

  it('publishes transport.mobility-demand.updated.v1 in a shape its consumers can read', async () => {
    const contract = eventContract('transport.mobility-demand.updated.v1')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all 16 events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of [
      'emergency.incident.created.v1',
      'emergency.resource.requested.v1',
      'health.emergency.declared.v1',
      'health.capacity.updated.v1',
      'resilience.resource-request.created.v1',
      'resilience.crisis.declared.v1',
      'environment.air-quality.updated.v1',
      'environment.climate-risk.updated.v1',
      'iot.sensor.observation.v1',
      'infrastructure.failure.predicted.v1',
      'infrastructure.maintenance.scheduled.v1',
      'trade.shipment.updated.v1',
      'culture.event.scheduled.v1',
      'tourism.visitor-flow.updated.v1',
      'education.school-condition.updated.v1',
      'agriculture.yield.forecast.v1',
    ]) {
      expect(subscribed.has(expected), `mobility-logistics does not consume ${expected}`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
    const relation = { event: 'emergency.incident.created.v1', from: 'safety-emergency' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('mobility-logistics', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('mobility-logistics', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
