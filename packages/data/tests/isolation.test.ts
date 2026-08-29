import { describe, expect, it, beforeEach } from 'vitest';
import { JsonFileAdapter, MemoryAdapter, openServiceStore, setStoreAdapter } from '@platform/data';

/**
 * The rule of §7, tested rather than asserted: a service store CANNOT reach
 * another service's namespace, because the API has no way to name one.
 */
describe('service data isolation', () => {
  beforeEach(() => setStoreAdapter(new MemoryAdapter()));

  it('keeps two services in separate namespaces', () => {
    const health = openServiceStore('health');
    const tourism = openServiceStore('tourism');

    health.collection<{ id: string; beds: number }>('facilities').insert({ id: 'f1', beds: 40 });

    // Same collection NAME, different namespace: tourism sees nothing.
    expect(health.collection('facilities').count()).toBe(1);
    expect(tourism.collection<{ id: string }>('facilities').get('f1')).toBeUndefined();
    expect(tourism.collection('facilities').count()).toBe(0);
    expect(tourism.isEmpty()).toBe(true);
  });

  it('exposes no method that takes another namespace', () => {
    const store = openServiceStore('health');
    // The surface is deliberately small; nothing here accepts a service id.
    expect(Object.keys(store).sort()).toEqual([
      'collection',
      'collections',
      'flush',
      'isEmpty',
      'serviceId',
      'stats',
    ]);
  });

  it('rejects a namespace that is not a service id shape', () => {
    // The JSON adapter — the one that actually runs — refuses anything that
    // could escape the data directory.
    const adapter = new JsonFileAdapter();
    expect(() => adapter.load('../../etc/passwd')).toThrow(/Invalid store namespace/);
  });

  it('supports the query surface services actually use', () => {
    const store = openServiceStore('land');
    const parcels = store.collection<{ id: string; governorate: string; area: number }>('parcels');
    parcels.insertMany([
      { id: 'p1', governorate: 'TN-11', area: 3 },
      { id: 'p2', governorate: 'TN-41', area: 9 },
      { id: 'p3', governorate: 'TN-41', area: 1 },
    ]);

    expect(parcels.list({ where: { governorate: 'TN-41' } })).toHaveLength(2);
    expect(parcels.list({ sort: { key: 'area', direction: 'desc' } })[0].id).toBe('p2');
    expect(parcels.list({ limit: 1, offset: 1 })).toHaveLength(1);
    expect(parcels.update('p1', { area: 5 })?.area).toBe(5);
    expect(parcels.delete('p1')).toBe(true);
    expect(parcels.count()).toBe(2);
    expect(() => parcels.require('nope')).toThrow(/does not exist in land/);
  });
});
