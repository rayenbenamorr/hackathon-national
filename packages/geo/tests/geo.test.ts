import { describe, expect, it } from 'vitest';
import {
  distanceKm,
  GOVERNORATES,
  governorate,
  governoratesGeoJson,
  inTunisia,
  nearest,
  pointInRing,
  circleZone,
  resolveGovernorate,
  seededRandom,
  syntheticPointIn,
} from '@platform/geo';

describe('geo foundation', () => {
  it('knows the 24 governorates', () => {
    expect(GOVERNORATES).toHaveLength(24);
    expect(new Set(GOVERNORATES.map((g) => g.code)).size).toBe(24);
    expect(governorate('Sfax')?.code).toBe('TN-61');
    expect(governorate('TN-11')?.name).toBe('Tunis');
  });

  it('measures a distance that matches reality', () => {
    // Tunis → Sfax is roughly 240 km as the crow flies.
    const d = distanceKm(governorate('TN-11')!, governorate('TN-61')!);
    expect(d).toBeGreaterThan(220);
    expect(d).toBeLessThan(280);
  });

  it('finds the nearest item — the platform most reused primitive', () => {
    const resources = [
      { id: 'a', location: { lat: 36.8, lon: 10.18 } },
      { id: 'b', location: { lat: 34.74, lon: 10.76 } },
      { id: 'c', location: { lat: 33.88, lon: 10.09 } },
    ];
    const [best] = nearest({ lat: 35.0, lon: 10.5 }, resources, (r) => r.location, { limit: 1 });
    expect(best.item.id).toBe('b');
    expect(best.distanceKm).toBeGreaterThan(0);
  });

  it('reverse-geocodes to a governorate', () => {
    expect(resolveGovernorate({ lat: 36.81, lon: 10.17 }).code).toBe('TN-11');
    expect(inTunisia({ lat: 34, lon: 9 })).toBe(true);
    expect(inTunisia({ lat: 48.85, lon: 2.35 })).toBe(false);
  });

  it('does point-in-polygon on a generated zone', () => {
    const centre = { lat: 35.68, lon: 10.1 };
    const ring = circleZone(centre, 20);
    expect(pointInRing(centre, ring)).toBe(true);
    expect(pointInRing({ lat: 33.0, lon: 8.0 }, ring)).toBe(false);
  });

  it('produces map-ready GeoJSON', () => {
    const collection = governoratesGeoJson();
    expect(collection.type).toBe('FeatureCollection');
    expect(collection.features).toHaveLength(24);
    expect(collection.features[0].properties.synthetic).toBe(true);
  });

  it('places synthetic points deterministically, so every laptop agrees', () => {
    const a = syntheticPointIn('TN-41', seededRandom('demo'));
    const b = syntheticPointIn('TN-41', seededRandom('demo'));
    expect(a).toEqual(b);
    expect(a.governorate).toBe('TN-41');
    expect(inTunisia(a)).toBe(true);
  });
});
