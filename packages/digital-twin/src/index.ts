import { z } from 'zod';
import type { ServiceStore } from '@platform/data';
import { GeoLocation, type SensorObservation } from '@platform/refs';

/**
 * DIGITAL TWIN FOUNDATION (§15)
 *
 * A twin is the living state of one real thing: a dam, a hospital, a bus line,
 * a governorate, an olive farm. Every ministry keeps twins of what it owns; the
 * National Digital Twin service keeps REFERENCES to all of them and never a
 * copy of anyone's private data — that is the difference between a national
 * twin and a national database, and it is enforced by which service owns what.
 *
 * PRIVACY: there is no citizen twin. `citizen-cohort` exists instead. A cohort
 * is a group with a size, never a person with a name.
 */
export const TwinType = z.enum([
  'asset',
  'facility',
  'hospital',
  'school',
  'farm',
  'water-body',
  'region',
  'network',
  'vehicle',
  'process',
  'environment-system',
  'infrastructure',
  'heritage-site',
  'citizen-cohort',
]);
export type TwinType = z.infer<typeof TwinType>;

export const TwinRelationship = z.object({
  relation: z.string().describe('e.g. "supplies", "depends-on", "located-in", "serves"'),
  targetTwinId: z.string(),
  targetService: z.string().optional().describe('Set when the other twin belongs to another ministry.'),
});
export type TwinRelationship = z.infer<typeof TwinRelationship>;

export const TwinObservation = z.object({
  metric: z.string(),
  value: z.number(),
  unit: z.string(),
  at: z.string().datetime(),
  sensorId: z.string().optional(),
  quality: z.enum(['good', 'degraded', 'suspect']).default('good'),
});
export type TwinObservation = z.infer<typeof TwinObservation>;

export const TwinHistoryEntry = z.object({
  at: z.string().datetime(),
  change: z.record(z.string(), z.unknown()),
  reason: z.string(),
});
export type TwinHistoryEntry = z.infer<typeof TwinHistoryEntry>;

export const Twin = z.object({
  id: z.string(),
  type: TwinType,
  label: z.string(),
  ownerService: z.string(),
  /** The current, queryable condition. Domain-specific by design. */
  state: z.record(z.string(), z.unknown()).default({}),
  location: GeoLocation.optional(),
  attributes: z.record(z.string(), z.unknown()).default({}),
  observations: z.array(TwinObservation).default([]),
  relationships: z.array(TwinRelationship).default([]),
  history: z.array(TwinHistoryEntry).default([]),
  lastUpdated: z.string().datetime(),
  synthetic: z.boolean().default(true),
});
export type Twin = z.infer<typeof Twin>;

const MAX_OBSERVATIONS = 60;
const MAX_HISTORY = 40;

export interface TwinRegistry {
  upsert(input: TwinInput): Twin;
  get(id: string): Twin | undefined;
  list(filter?: { type?: TwinType; governorate?: string; limit?: number }): Twin[];
  setState(id: string, patch: Record<string, unknown>, reason: string): Twin | undefined;
  applyObservation(
    id: string,
    observation: TwinObservation | SensorObservation,
    stateKey?: string,
  ): Twin | undefined;
  relate(id: string, relation: string, targetTwinId: string, targetService?: string): Twin | undefined;
  history(id: string, limit?: number): TwinHistoryEntry[];
  count(): number;
  /** Every twin, reduced to what other ministries are allowed to see. */
  references(): TwinReference[];
}

export interface TwinInput {
  id: string;
  type: TwinType;
  label: string;
  state?: Record<string, unknown>;
  location?: z.infer<typeof GeoLocation>;
  attributes?: Record<string, unknown>;
  relationships?: TwinRelationship[];
}

/**
 * What crosses a service boundary. Notice what is missing: `state` details,
 * `observations`, `history`. Another ministry learns that a twin exists, where
 * it is and how healthy it is — not its internal record.
 */
export interface TwinReference {
  id: string;
  type: TwinType;
  label: string;
  ownerService: string;
  location?: z.infer<typeof GeoLocation>;
  status?: string;
  lastUpdated: string;
}

export function createTwinRegistry(store: ServiceStore, serviceId: string): TwinRegistry {
  const twins = store.collection<Twin>('twins');

  const touch = (twin: Twin, change: Record<string, unknown>, reason: string): Twin => {
    const next: Twin = {
      ...twin,
      lastUpdated: new Date().toISOString(),
      history: [...twin.history, { at: new Date().toISOString(), change, reason }].slice(-MAX_HISTORY),
    };
    twins.upsert(next);
    return next;
  };

  return {
    upsert(input) {
      const existing = twins.get(input.id);
      const twin: Twin = {
        id: input.id,
        type: input.type,
        label: input.label,
        ownerService: serviceId,
        state: { ...(existing?.state ?? {}), ...(input.state ?? {}) },
        location: input.location ?? existing?.location,
        attributes: { ...(existing?.attributes ?? {}), ...(input.attributes ?? {}) },
        observations: existing?.observations ?? [],
        relationships: input.relationships ?? existing?.relationships ?? [],
        history: existing?.history ?? [],
        lastUpdated: new Date().toISOString(),
        synthetic: true,
      };
      twins.upsert(twin);
      return twin;
    },

    get: (id) => twins.get(id),

    list(filter = {}) {
      return twins.list({
        match: (twin) =>
          (!filter.type || twin.type === filter.type) &&
          (!filter.governorate || twin.location?.governorate === filter.governorate),
        limit: filter.limit,
        sort: { key: 'lastUpdated', direction: 'desc' },
      });
    },

    setState(id, patch, reason) {
      const twin = twins.get(id);
      if (!twin) return undefined;
      return touch({ ...twin, state: { ...twin.state, ...patch } }, patch, reason);
    },

    /**
     * The bridge from IoT to twin. A raw `SensorObservation` is accepted as-is,
     * so a consumer can forward what the bus delivered without reshaping it —
     * which is exactly what the generated event handlers do.
     */
    applyObservation(id, observation, stateKey) {
      const twin = twins.get(id);
      if (!twin) return undefined;

      const normalised: TwinObservation =
        'metric' in observation
          ? (observation as TwinObservation)
          : {
              metric: (observation as SensorObservation).sensorKind,
              value: (observation as SensorObservation).value,
              unit: (observation as SensorObservation).unit,
              at: (observation as SensorObservation).observedAt,
              sensorId: (observation as SensorObservation).sensorId,
              quality: (observation as SensorObservation).quality ?? 'good',
            };

      const key = stateKey ?? normalised.metric;
      const next: Twin = {
        ...twin,
        state: { ...twin.state, [key]: normalised.value, [`${key}Unit`]: normalised.unit },
        observations: [...twin.observations, normalised].slice(-MAX_OBSERVATIONS),
      };
      return touch(
        next,
        { [key]: normalised.value },
        `observation from ${normalised.sensorId ?? 'unknown sensor'}`,
      );
    },

    relate(id, relation, targetTwinId, targetService) {
      const twin = twins.get(id);
      if (!twin) return undefined;
      const already = twin.relationships.some(
        (r) => r.relation === relation && r.targetTwinId === targetTwinId,
      );
      if (already) return twin;
      return touch(
        { ...twin, relationships: [...twin.relationships, { relation, targetTwinId, targetService }] },
        { relation, targetTwinId },
        'relationship added',
      );
    },

    history(id, limit = 20) {
      return (twins.get(id)?.history ?? []).slice(-limit).reverse();
    },

    count: () => twins.count(),

    references() {
      return twins.list().map((twin) => ({
        id: twin.id,
        type: twin.type,
        label: twin.label,
        ownerService: twin.ownerService,
        location: twin.location,
        status: typeof twin.state.status === 'string' ? twin.state.status : undefined,
        lastUpdated: twin.lastUpdated,
      }));
    },
  };
}
