/**
 * GEO / MAP FOUNDATION (§16)
 *
 * Almost every ministry is geographic. This package is the shared vocabulary so
 * that "near", "inside", "which governorate" mean exactly the same thing in
 * Health as in Environment as in Mobility.
 *
 * Deliberately dependency-free: no turf, no PostGIS. Spherical maths on a
 * country-sized bounding box is accurate enough for a hackathon prototype and
 * it keeps `pnpm install` small.
 */
import type { GeoLocation } from '@platform/refs';
export * from './governorates.ts';
import { GOVERNORATES, TUNISIA_BBOX, type Governorate } from './governorates.ts';

const EARTH_RADIUS_KM = 6371.0088;
const rad = (deg: number) => (deg * Math.PI) / 180;

// ---------------------------------------------------------------------------
// Distance and proximity
// ---------------------------------------------------------------------------

export interface LatLon {
  lat: number;
  lon: number;
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing in degrees, 0 = north. Useful for dispatch UIs. */
export function bearingDeg(a: LatLon, b: LatLon): number {
  const dLon = rad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * The single most reused geospatial primitive on this platform:
 * "give me the closest available X". Emergency → Mobility, Health → Transport,
 * Resilience → Logistics all go through it.
 */
export function nearest<T>(
  from: LatLon,
  items: readonly T[],
  locate: (item: T) => LatLon | undefined,
  options: { limit?: number; maxKm?: number } = {},
): Array<{ item: T; distanceKm: number }> {
  const { limit = 1, maxKm = Infinity } = options;
  return items
    .flatMap((item) => {
      const loc = locate(item);
      if (!loc) return [];
      const d = distanceKm(from, loc);
      return d <= maxKm ? [{ item, distanceKm: Math.round(d * 100) / 100 }] : [];
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function withinKm(from: LatLon, to: LatLon, km: number): boolean {
  return distanceKm(from, to) <= km;
}

// ---------------------------------------------------------------------------
// Zones
// ---------------------------------------------------------------------------

/** Nearest governorate centroid — the platform's cheap reverse geocoder. */
export function resolveGovernorate(point: LatLon): Governorate {
  let best = GOVERNORATES[0];
  let bestD = Infinity;
  for (const g of GOVERNORATES) {
    const d = distanceKm(point, g);
    if (d < bestD) {
      bestD = d;
      best = g;
    }
  }
  return best;
}

export function inTunisia(point: LatLon): boolean {
  const [minLon, minLat, maxLon, maxLat] = TUNISIA_BBOX;
  return point.lon >= minLon && point.lon <= maxLon && point.lat >= minLat && point.lat <= maxLat;
}

/** Ray-casting point-in-polygon over a GeoJSON ring ([lon, lat] pairs). */
export function pointInRing(point: LatLon, ring: Array<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > point.lat !== yj > point.lat && point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Approximate circular zone as a GeoJSON polygon — good enough to draw. */
export function circleZone(centre: LatLon, radiusKm: number, steps = 32): Array<[number, number]> {
  const ring: Array<[number, number]> = [];
  const latDeg = radiusKm / 110.574;
  const lonDeg = radiusKm / (111.32 * Math.cos(rad(centre.lat)));
  for (let i = 0; i <= steps; i++) {
    const a = (2 * Math.PI * i) / steps;
    ring.push([centre.lon + lonDeg * Math.cos(a), centre.lat + latDeg * Math.sin(a)]);
  }
  return ring;
}

export function bbox(points: readonly LatLon[]): [number, number, number, number] {
  const lons = points.map((p) => p.lon);
  const lats = points.map((p) => p.lat);
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}

export function centroid(points: readonly LatLon[]): LatLon {
  const n = points.length || 1;
  return {
    lat: points.reduce((s, p) => s + p.lat, 0) / n,
    lon: points.reduce((s, p) => s + p.lon, 0) / n,
  };
}

// ---------------------------------------------------------------------------
// GeoJSON — what every map library on earth eats
// ---------------------------------------------------------------------------

export interface GeoFeature {
  type: 'Feature';
  geometry: { type: 'Point' | 'Polygon' | 'LineString'; coordinates: unknown };
  properties: Record<string, unknown>;
}

export interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

export function pointFeature(point: LatLon, properties: Record<string, unknown> = {}): GeoFeature {
  return { type: 'Feature', geometry: { type: 'Point', coordinates: [point.lon, point.lat] }, properties };
}

export function polygonFeature(
  ring: Array<[number, number]>,
  properties: Record<string, unknown> = {},
): GeoFeature {
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties };
}

export function featureCollection(features: GeoFeature[]): GeoFeatureCollection {
  return { type: 'FeatureCollection', features };
}

/** Every governorate as a map-ready FeatureCollection of centroids. */
export function governoratesGeoJson(): GeoFeatureCollection {
  return featureCollection(
    GOVERNORATES.map((g) =>
      pointFeature(g, {
        code: g.code,
        name: g.name,
        nameAr: g.nameAr,
        region: g.region,
        approxPopulation: g.approxPopulation,
        coastal: g.coastal,
        synthetic: true,
      }),
    ),
  );
}

// ---------------------------------------------------------------------------
// Deterministic synthetic placement
// ---------------------------------------------------------------------------

/**
 * Seeded PRNG (mulberry32). Seeding matters: every service seeds its synthetic
 * data from its own id, so the same farm sits at the same coordinates on every
 * laptop in the room. Screenshots and demos become comparable.
 */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A reproducible point scattered around a governorate centre. */
export function syntheticPointIn(governorateCode: string, rng: () => number, spreadKm = 18): GeoLocation {
  const g = GOVERNORATES.find((x) => x.code === governorateCode) ?? GOVERNORATES[0];
  const latDeg = spreadKm / 110.574;
  const lonDeg = spreadKm / (111.32 * Math.cos(rad(g.lat)));
  return {
    lat: Number((g.lat + (rng() - 0.5) * 2 * latDeg).toFixed(5)),
    lon: Number((g.lon + (rng() - 0.5) * 2 * lonDeg).toFixed(5)),
    governorate: g.code,
  };
}

export function pickGovernorate(rng: () => number): Governorate {
  return GOVERNORATES[Math.floor(rng() * GOVERNORATES.length)];
}
