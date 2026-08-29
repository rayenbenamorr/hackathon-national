/**
 * EVENT CONTRACTS — Tunisia Research Brain
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
 * A research project was registered or updated.
 *
 * Owner: `research` (Tunisia Research Brain) — no other service may publish this.
 */
export const ResearchProjectPublishedV1 = defineEvent({
  type: 'research.project.published.v1',
  owner: 'research',
  summary: 'A research project was registered or updated.',
  tags: ['research'],
  payload: z.object({
    projectId: z.string(),
    title: z.string(),
    discipline: z.string(),
    governorate: z.string(),
    trl: z.number().int(),
    publishedAt: z.string(),
  }),
  example: {
    projectId: 'project_0001',
    title: 'title-sample',
    discipline: 'discipline-sample',
    governorate: 'TN-11',
    trl: 12,
    publishedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A usable result was released.
 *
 * Owner: `research` (Tunisia Research Brain) — no other service may publish this.
 */
export const ResearchFindingReleasedV1 = defineEvent({
  type: 'research.finding.released.v1',
  owner: 'research',
  summary: 'A usable result was released.',
  tags: ['research'],
  payload: z.object({
    findingId: z.string(),
    projectId: z.string(),
    discipline: z.string(),
    summary: z.string(),
    applicableTo: z.array(z.string()),
    releasedAt: z.string(),
  }),
  example: {
    findingId: 'finding_0001',
    projectId: 'project_0001',
    discipline: 'discipline-sample',
    summary: 'Synthetic example value for summary.',
    applicableTo: ['food-water', 'environment'],
    releasedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A result was matched to a ministry need.
 *
 * Owner: `research` (Tunisia Research Brain) — no other service may publish this.
 */
export const ResearchTransferMatchedV1 = defineEvent({
  type: 'research.transfer.matched.v1',
  owner: 'research',
  summary: 'A result was matched to a ministry need.',
  tags: ['research'],
  payload: z.object({
    transferId: z.string(),
    findingId: z.string(),
    targetService: z.string(),
    need: z.string(),
    readiness: z.number().min(0).max(1),
    matchedAt: z.string(),
  }),
  example: {
    transferId: 'transfer_0001',
    findingId: 'finding_0001',
    targetService: 'targetService-sample',
    need: 'Synthetic example value for need.',
    readiness: 0.42,
    matchedAt: '2026-08-28T09:00:00.000Z',
  },
});
