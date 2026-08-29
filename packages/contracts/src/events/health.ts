/**
 * EVENT CONTRACTS — Connected Health Intelligence System
 *
 * Adding an event: declare it here with defineEvent(), then add it to
 * tools/spec/services.part*.mjs and run `pnpm generate` so the manifest,
 * the docs and the architecture registry agree with the code.
 *
 * Changing an event: adding an OPTIONAL field is safe. Anything else needs a
 * new version (`.v2`) with the `.v1` contract kept until every consumer moved.
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';
import { defineEvent } from '../registry.ts';

/**
 * Bed and emergency capacity at a facility. Consumed widely — dispatch depends on it.
 *
 * Owner: `health` (Connected Health Intelligence System) — no other service may publish this.
 */
export const HealthCapacityUpdatedV1 = defineEvent({
  type: 'health.capacity.updated.v1',
  owner: 'health',
  summary: 'Bed and emergency capacity at a facility. Consumed widely — dispatch depends on it.',
  tags: ['health'],
  payload: z.object({
    facilityId: z.string(),
    governorate: z.string(),
    location: GeoLocation,
    totalBeds: z.number().int(),
    availableBeds: z.number().int(),
    icuAvailable: z.number().int(),
    emergencyLoad: z.number().min(0).max(1),
    observedAt: z.string(),
  }),
  example: {
    facilityId: 'facility_0001',
    governorate: 'TN-11',
    location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
    totalBeds: 12,
    availableBeds: 12,
    icuAvailable: 12,
    emergencyLoad: 0.42,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * An unusual health signal was detected in a governorate.
 *
 * Owner: `health` (Connected Health Intelligence System) — no other service may publish this.
 */
export const HealthEpidemicSignalDetectedV1 = defineEvent({
  type: 'health.epidemic-signal.detected.v1',
  owner: 'health',
  summary: 'An unusual health signal was detected in a governorate.',
  tags: ['health'],
  payload: z.object({
    signalId: z.string(),
    governorate: z.string(),
    syndrome: z.string(),
    excessCases: z.number().int(),
    confidence: z.number().min(0).max(1),
    suspectedDrivers: z.array(z.string()),
    detectedAt: z.string(),
  }),
  example: {
    signalId: 'signal_0001',
    governorate: 'TN-11',
    syndrome: 'syndrome-sample',
    excessCases: 12,
    confidence: 0.42,
    suspectedDrivers: ['air-quality', 'water-quality'],
    detectedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Health declares an emergency requiring resources it does not own.
 *
 * Owner: `health` (Connected Health Intelligence System) — no other service may publish this.
 */
export const HealthEmergencyDeclaredV1 = defineEvent({
  type: 'health.emergency.declared.v1',
  owner: 'health',
  summary: 'Health declares an emergency requiring resources it does not own.',
  tags: ['health'],
  payload: z.object({
    emergencyId: z.string(),
    governorate: z.string(),
    location: GeoLocation,
    requiredResources: z.array(z.string()),
    patients: z.number().int(),
    declaredAt: z.string(),
  }),
  example: {
    emergencyId: 'emergency_0001',
    governorate: 'TN-11',
    location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
    requiredResources: ['water-tanker', 'ambulance'],
    patients: 12,
    declaredAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Aggregate care activity for a cohort.
 *
 * Owner: `health` (Connected Health Intelligence System) — no other service may publish this.
 */
export const HealthCareEpisodeUpdatedV1 = defineEvent({
  type: 'health.care-episode.updated.v1',
  owner: 'health',
  summary: 'Aggregate care activity for a cohort.',
  tags: ['health'],
  payload: z.object({
    cohortId: z.string(),
    governorate: z.string(),
    episodes: z.number().int(),
    averageStayDays: z.number(),
    updatedAt: z.string(),
  }),
  example: {
    cohortId: 'cohort_0001',
    governorate: 'TN-11',
    episodes: 12,
    averageStayDays: 42.5,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});
