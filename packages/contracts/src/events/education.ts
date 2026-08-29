/**
 * EVENT CONTRACTS — Adaptive Education OS
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
 * Cohort mastery moved for a domain.
 *
 * Owner: `education` (Adaptive Education OS) — no other service may publish this.
 */
export const EducationLearningProgressUpdatedV1 = defineEvent({
  type: 'education.learning-progress.updated.v1',
  owner: 'education',
  summary: 'Cohort mastery moved for a domain.',
  tags: ['education'],
  payload: z.object({
    cohortId: z.string(),
    governorate: z.string(),
    domain: z.string(),
    masteryIndex: z.number().min(0).max(1),
    pupils: z.number().int(),
    updatedAt: z.string(),
  }),
  example: {
    cohortId: 'cohort_0001',
    governorate: 'TN-11',
    domain: 'domain-sample',
    masteryIndex: 0.42,
    pupils: 12,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A programme was created or adapted, usually against a detected skill gap.
 *
 * Owner: `education` (Adaptive Education OS) — no other service may publish this.
 */
export const EducationProgramUpdatedV1 = defineEvent({
  type: 'education.program.updated.v1',
  owner: 'education',
  summary: 'A programme was created or adapted, usually against a detected skill gap.',
  tags: ['education'],
  payload: z.object({
    programId: z.string(),
    title: z.string(),
    level: z.string(),
    discipline: z.string(),
    governorate: z.string(),
    reason: z.string(),
    updatedAt: z.string(),
  }),
  example: {
    programId: 'program_0001',
    title: 'title-sample',
    level: 'level-sample',
    discipline: 'discipline-sample',
    governorate: 'TN-11',
    reason: 'Synthetic example value for reason.',
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Building or environmental condition at a school changed.
 *
 * Owner: `education` (Adaptive Education OS) — no other service may publish this.
 */
export const EducationSchoolConditionUpdatedV1 = defineEvent({
  type: 'education.school-condition.updated.v1',
  owner: 'education',
  summary: 'Building or environmental condition at a school changed.',
  tags: ['education'],
  payload: z.object({
    schoolId: z.string(),
    governorate: z.string(),
    buildingCondition: z.number().min(0).max(1),
    airQualityIndex: z.number(),
    pupils: z.number().int(),
    observedAt: z.string(),
  }),
  example: {
    schoolId: 'school_0001',
    governorate: 'TN-11',
    buildingCondition: 0.42,
    airQualityIndex: 42.5,
    pupils: 12,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});
