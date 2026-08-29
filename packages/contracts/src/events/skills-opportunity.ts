/**
 * EVENT CONTRACTS — National Skills & Opportunity OS
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
 * Demand for a skill exceeds regional supply.
 *
 * Owner: `skills-opportunity` (National Skills & Opportunity OS) — no other service may publish this.
 */
export const SkillsGapDetectedV1 = defineEvent({
  type: 'skills.gap.detected.v1',
  owner: 'skills-opportunity',
  summary: 'Demand for a skill exceeds regional supply.',
  tags: ['skills-opportunity'],
  payload: z.object({
    gapId: z.string(),
    skill: z.string(),
    domain: z.string(),
    governorate: z.string(),
    gap: z.number(),
    drivenBy: z.array(z.string()),
    detectedAt: z.string(),
  }),
  example: {
    gapId: 'gap_0001',
    skill: 'skill-sample',
    domain: 'domain-sample',
    governorate: 'TN-11',
    gap: 42.5,
    drivenBy: ['alpha', 'beta'],
    detectedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A short real assignment was opened against a gap.
 *
 * Owner: `skills-opportunity` (National Skills & Opportunity OS) — no other service may publish this.
 */
export const SkillsMicroMissionPublishedV1 = defineEvent({
  type: 'skills.micro-mission.published.v1',
  owner: 'skills-opportunity',
  summary: 'A short real assignment was opened against a gap.',
  tags: ['skills-opportunity'],
  payload: z.object({
    missionId: z.string(),
    title: z.string(),
    skill: z.string(),
    governorate: z.string(),
    durationDays: z.number().int(),
    requestedBy: z.string(),
    publishedAt: z.string(),
  }),
  example: {
    missionId: 'mission_0001',
    title: 'title-sample',
    skill: 'skill-sample',
    governorate: 'TN-11',
    durationDays: 12,
    requestedBy: 'requestedBy-sample',
    publishedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Regional skill supply moved.
 *
 * Owner: `skills-opportunity` (National Skills & Opportunity OS) — no other service may publish this.
 */
export const SkillsProfileUpdatedV1 = defineEvent({
  type: 'skills.profile.updated.v1',
  owner: 'skills-opportunity',
  summary: 'Regional skill supply moved.',
  tags: ['skills-opportunity'],
  payload: z.object({
    skill: z.string(),
    governorate: z.string(),
    supplyIndex: z.number().min(0).max(1),
    demandIndex: z.number().min(0).max(1),
    updatedAt: z.string(),
  }),
  example: {
    skill: 'skill-sample',
    governorate: 'TN-11',
    supplyIndex: 0.42,
    demandIndex: 0.42,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});
