/**
 * EVENT CONTRACTS — Global Tunisia Network
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
 * A consular request was filed abroad.
 *
 * Owner: `global-tunisia` (Global Tunisia Network) — no other service may publish this.
 */
export const GlobalConsularRequestCreatedV1 = defineEvent({
  type: 'global.consular-request.created.v1',
  owner: 'global-tunisia',
  summary: 'A consular request was filed abroad.',
  tags: ['global-tunisia'],
  payload: z.object({
    requestId: z.string(),
    post: z.string(),
    country: z.string(),
    requestType: z.enum(['passport', 'civil-status', 'visa', 'assistance', 'investment']),
    filedAt: z.string(),
  }),
  example: {
    requestId: 'request_0001',
    post: 'post-sample',
    country: 'country-sample',
    requestType: 'passport',
    filedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * An opportunity at home is opened to the diaspora.
 *
 * Owner: `global-tunisia` (Global Tunisia Network) — no other service may publish this.
 */
export const GlobalOpportunityPublishedV1 = defineEvent({
  type: 'global.opportunity.published.v1',
  owner: 'global-tunisia',
  summary: 'An opportunity at home is opened to the diaspora.',
  tags: ['global-tunisia'],
  payload: z.object({
    opportunityId: z.string(),
    title: z.string(),
    sector: z.string(),
    governorate: z.string(),
    requiredSkills: z.array(z.string()),
    publishedAt: z.string(),
  }),
  example: {
    opportunityId: 'opportunity_0001',
    title: 'title-sample',
    sector: 'sector-sample',
    governorate: 'TN-11',
    requiredSkills: ['software', 'logistics'],
    publishedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Aggregate diaspora signal: skills concentration and investment appetite per country.
 *
 * Owner: `global-tunisia` (Global Tunisia Network) — no other service may publish this.
 */
export const GlobalDiasporaSignalUpdatedV1 = defineEvent({
  type: 'global.diaspora-signal.updated.v1',
  owner: 'global-tunisia',
  summary: 'Aggregate diaspora signal: skills concentration and investment appetite per country.',
  tags: ['global-tunisia'],
  payload: z.object({
    country: z.string(),
    cohortSize: z.number().int(),
    topSkills: z.array(z.string()),
    investmentAppetite: z.number().min(0).max(1),
    observedAt: z.string(),
  }),
  example: {
    country: 'country-sample',
    cohortSize: 12,
    topSkills: ['software', 'medicine'],
    investmentAppetite: 0.42,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});
