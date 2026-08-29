import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryAdapter, openServiceStore, setStoreAdapter } from '@platform/data';
import { createTwinRegistry } from '@platform/digital-twin';

describe('digital twin', () => {
  beforeEach(() => setStoreAdapter(new MemoryAdapter()));

  const registry = () => createTwinRegistry(openServiceStore('food-water'), 'food-water');

  it('holds the shape the brief asks for (§15)', () => {
    const twins = registry();
    const twin = twins.upsert({
      id: 'twin_farm_1',
      type: 'farm',
      label: 'Olive farm — Kairouan',
      location: { lat: 35.68, lon: 10.1, governorate: 'TN-41' },
      state: { soilMoisturePct: 28 },
      attributes: { crop: 'olive' },
    });

    for (const field of [
      'id',
      'type',
      'state',
      'location',
      'attributes',
      'observations',
      'relationships',
      'history',
      'lastUpdated',
    ]) {
      expect(twin).toHaveProperty(field);
    }
    expect(twin.ownerService).toBe('food-water');
    expect(twin.synthetic).toBe(true);
  });

  it('accepts a raw sensor observation and records history', () => {
    const twins = registry();
    twins.upsert({
      id: 't1',
      type: 'farm',
      label: 'Farm',
      location: { lat: 35, lon: 10, governorate: 'TN-41' },
    });

    twins.applyObservation('t1', {
      observationId: 'obs_1',
      sensorId: 'sensor_1',
      sensorKind: 'soil-moisture',
      value: 22.5,
      unit: '%',
      location: { lat: 35, lon: 10, governorate: 'TN-41' },
      observedAt: new Date().toISOString(),
      quality: 'good',
      synthetic: true,
    });

    const twin = twins.get('t1')!;
    expect(twin.state['soil-moisture']).toBe(22.5);
    expect(twin.observations).toHaveLength(1);
    expect(twins.history('t1')[0].reason).toMatch(/observation from sensor_1/);
  });

  it('relates twins across ministries without copying their data', () => {
    const twins = registry();
    twins.upsert({ id: 't1', type: 'farm', label: 'Farm' });
    twins.relate('t1', 'supplied-by', 'twin_reservoir_9', 'infrastructure');

    const references = twins.references();
    expect(references[0]).not.toHaveProperty('observations');
    expect(references[0]).not.toHaveProperty('state');
    expect(twins.get('t1')!.relationships[0]).toEqual({
      relation: 'supplied-by',
      targetTwinId: 'twin_reservoir_9',
      targetService: 'infrastructure',
    });
  });

  it('filters by governorate, which is how every ministry queries', () => {
    const twins = registry();
    twins.upsert({ id: 'a', type: 'farm', label: 'A', location: { lat: 35, lon: 10, governorate: 'TN-41' } });
    twins.upsert({ id: 'b', type: 'farm', label: 'B', location: { lat: 36, lon: 10, governorate: 'TN-11' } });
    expect(twins.list({ governorate: 'TN-41' })).toHaveLength(1);
    expect(twins.count()).toBe(2);
  });
});
