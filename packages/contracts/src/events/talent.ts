/**
 * EVENT CONTRACTS — National Talent Intelligence Network
 *
 * Adding an event: declare it here with defineEvent(), then add it to
 * tools/spec/services.part*.mjs and run `pnpm generate` so the manifest,
 * the docs and the architecture registry agree with the code.
 *
 * Changing an event: adding an OPTIONAL field is safe. Anything else needs a
 * new version (`.v2`) with the `.v1` contract kept until every consumer moved.
 */
import { z } from 'zod';
import { defineEvent } from '../registry.ts';

/**
 * Aggregate performance for an athlete cohort.
 *
 * Owner: `talent` (National Talent Intelligence Network) — no other service may publish this.
 */
export const TalentPerformanceUpdatedV1 = defineEvent({
  type: 'talent.performance.updated.v1',
  owner: 'talent',
  summary: 'Aggregate performance for an athlete cohort.',
  tags: ['talent'],
  payload: z.object({
    cohortId: z.string(),
    discipline: z.string(),
    governorate: z.string(),
    performanceIndex: z.number().min(0).max(1),
    athletes: z.number().int(),
    updatedAt: z.string(),
  }),
  example: {
    cohortId: 'cohort_0001',
    discipline: 'discipline-sample',
    governorate: 'TN-11',
    performanceIndex: 0.42,
    athletes: 12,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Usage and condition at a sports facility.
 *
 * Owner: `talent` (National Talent Intelligence Network) — no other service may publish this.
 */
export const TalentFacilityUsageUpdatedV1 = defineEvent({
  type: 'talent.facility-usage.updated.v1',
  owner: 'talent',
  summary: 'Usage and condition at a sports facility.',
  tags: ['talent'],
  payload: z.object({
    facilityId: z.string(),
    governorate: z.string(),
    weeklyUsers: z.number().int(),
    condition: z.number().min(0).max(1),
    energyKwhMonth: z.number(),
    observedAt: z.string(),
  }),
  example: {
    facilityId: 'facility_0001',
    governorate: 'TN-11',
    weeklyUsers: 12,
    condition: 0.42,
    energyKwhMonth: 42.5,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Training load suggests elevated injury risk for a cohort.
 *
 * Owner: `talent` (National Talent Intelligence Network) — no other service may publish this.
 */
export const TalentInjuryRiskFlaggedV1 = defineEvent({
  type: 'talent.injury-risk.flagged.v1',
  owner: 'talent',
  summary: 'Training load suggests elevated injury risk for a cohort.',
  tags: ['talent'],
  payload: z.object({
    riskId: z.string(),
    cohortId: z.string(),
    discipline: z.string(),
    riskScore: z.number().min(0).max(1),
    drivers: z.array(z.string()),
    flaggedAt: z.string(),
  }),
  example: {
    riskId: 'risk_0001',
    cohortId: 'cohort_0001',
    discipline: 'discipline-sample',
    riskScore: 0.42,
    drivers: ['drought-index', 'sensor-observations'],
    flaggedAt: '2026-08-28T09:00:00.000Z',
  },
});
