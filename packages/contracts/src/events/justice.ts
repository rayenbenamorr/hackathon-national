/**
 * EVENT CONTRACTS — Justice Intelligence OS
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
 * A new case entered the system.
 *
 * Owner: `justice` (Justice Intelligence OS) — no other service may publish this.
 */
export const JusticeCaseFiledV1 = defineEvent({
  type: 'justice.case.filed.v1',
  owner: 'justice',
  summary: 'A new case entered the system.',
  tags: ['justice'],
  payload: z.object({
    caseId: z.string(),
    matter: z.string(),
    court: z.string(),
    governorate: z.string(),
    filedAt: z.string(),
  }),
  example: {
    caseId: 'case_0001',
    matter: 'matter-sample',
    court: 'court-sample',
    governorate: 'TN-11',
    filedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A case reached a decision.
 *
 * Owner: `justice` (Justice Intelligence OS) — no other service may publish this.
 */
export const JusticeCaseDecidedV1 = defineEvent({
  type: 'justice.case.decided.v1',
  owner: 'justice',
  summary: 'A case reached a decision.',
  tags: ['justice'],
  payload: z.object({
    caseId: z.string(),
    matter: z.string(),
    durationDays: z.number().int(),
    governorate: z.string(),
    decidedAt: z.string(),
  }),
  example: {
    caseId: 'case_0001',
    matter: 'matter-sample',
    durationDays: 12,
    governorate: 'TN-11',
    decidedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Pending load and saturation for a court.
 *
 * Owner: `justice` (Justice Intelligence OS) — no other service may publish this.
 */
export const JusticeCourtLoadUpdatedV1 = defineEvent({
  type: 'justice.court-load.updated.v1',
  owner: 'justice',
  summary: 'Pending load and saturation for a court.',
  tags: ['justice'],
  payload: z.object({
    court: z.string(),
    governorate: z.string(),
    pendingCases: z.number().int(),
    saturation: z.number().min(0).max(1),
    averageDelayDays: z.number().int(),
    observedAt: z.string(),
  }),
  example: {
    court: 'court-sample',
    governorate: 'TN-11',
    pendingCases: 12,
    saturation: 0.42,
    averageDelayDays: 12,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A legal text became applicable — other ministries may need to adapt.
 *
 * Owner: `justice` (Justice Intelligence OS) — no other service may publish this.
 */
export const JusticeLegalTextPublishedV1 = defineEvent({
  type: 'justice.legal-text.published.v1',
  owner: 'justice',
  summary: 'A legal text became applicable — other ministries may need to adapt.',
  tags: ['justice'],
  payload: z.object({
    textId: z.string(),
    title: z.string(),
    domain: z.string(),
    effectiveFrom: z.string(),
    summary: z.string(),
  }),
  example: {
    textId: 'text_0001',
    title: 'title-sample',
    domain: 'domain-sample',
    effectiveFrom: '2026-08-28T09:00:00.000Z',
    summary: 'Synthetic example value for summary.',
  },
});
