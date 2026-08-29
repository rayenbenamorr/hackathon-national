/**
 * EVENT CONTRACTS — Social Mobility OS
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
 * A cohort vulnerability index moved.
 *
 * Owner: `social-mobility` (Social Mobility OS) — no other service may publish this.
 */
export const SocialVulnerabilityUpdatedV1 = defineEvent({
  type: 'social.vulnerability.updated.v1',
  owner: 'social-mobility',
  summary: 'A cohort vulnerability index moved.',
  tags: ['social-mobility'],
  payload: z.object({
    cohortId: z.string(),
    governorate: z.string(),
    vulnerabilityIndex: z.number().min(0).max(1),
    drivers: z.array(z.string()),
    size: z.number().int(),
    updatedAt: z.string(),
  }),
  example: {
    cohortId: 'cohort_0001',
    governorate: 'TN-11',
    vulnerabilityIndex: 0.42,
    drivers: ['drought-index', 'sensor-observations'],
    size: 12,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A benefit was granted to a cohort.
 *
 * Owner: `social-mobility` (Social Mobility OS) — no other service may publish this.
 */
export const SocialBenefitGrantedV1 = defineEvent({
  type: 'social.benefit.granted.v1',
  owner: 'social-mobility',
  summary: 'A benefit was granted to a cohort.',
  tags: ['social-mobility'],
  payload: z.object({
    benefitId: z.string(),
    cohortId: z.string(),
    benefitType: z.string(),
    governorate: z.string(),
    beneficiaries: z.number().int(),
    grantedAt: z.string(),
  }),
  example: {
    benefitId: 'benefit_0001',
    cohortId: 'cohort_0001',
    benefitType: 'benefitType-sample',
    governorate: 'TN-11',
    beneficiaries: 12,
    grantedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A need was detected from cross-ministry signals before anyone asked.
 *
 * Owner: `social-mobility` (Social Mobility OS) — no other service may publish this.
 */
export const SocialHouseholdNeedDetectedV1 = defineEvent({
  type: 'social.household-need.detected.v1',
  owner: 'social-mobility',
  summary: 'A need was detected from cross-ministry signals before anyone asked.',
  tags: ['social-mobility'],
  payload: z.object({
    needId: z.string(),
    cohortId: z.string(),
    needType: z.enum(['water', 'energy', 'food', 'health', 'housing', 'schooling', 'income']),
    governorate: z.string(),
    urgency: z.enum(['normal', 'high', 'critical']),
    detectedAt: z.string(),
  }),
  example: {
    needId: 'need_0001',
    cohortId: 'cohort_0001',
    needType: 'water',
    governorate: 'TN-11',
    urgency: 'normal',
    detectedAt: '2026-08-28T09:00:00.000Z',
  },
});
