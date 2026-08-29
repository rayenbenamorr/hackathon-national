/**
 * EVENT CONTRACTS — Tunisia Immersive Tourism OS
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
 * Visitor volume at a site or zone.
 *
 * Owner: `tourism` (Tunisia Immersive Tourism OS) — no other service may publish this.
 */
export const TourismVisitorFlowUpdatedV1 = defineEvent({
  type: 'tourism.visitor-flow.updated.v1',
  owner: 'tourism',
  summary: 'Visitor volume at a site or zone.',
  tags: ['tourism'],
  payload: z.object({
    siteId: z.string(),
    governorate: z.string(),
    visitorsWeek: z.number().int(),
    originMix: z.array(z.string()),
    observedAt: z.string(),
  }),
  example: {
    siteId: 'site_0001',
    governorate: 'TN-11',
    visitorsWeek: 12,
    originMix: ['domestic', 'europe'],
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A site is over its sustainable capacity.
 *
 * Owner: `tourism` (Tunisia Immersive Tourism OS) — no other service may publish this.
 */
export const TourismSitePressureDetectedV1 = defineEvent({
  type: 'tourism.site-pressure.detected.v1',
  owner: 'tourism',
  summary: 'A site is over its sustainable capacity.',
  tags: ['tourism'],
  payload: z.object({
    siteId: z.string(),
    governorate: z.string(),
    pressureIndex: z.number().min(0).max(1),
    capacity: z.number().int(),
    visitorsWeek: z.number().int(),
    detectedAt: z.string(),
  }),
  example: {
    siteId: 'site_0001',
    governorate: 'TN-11',
    pressureIndex: 0.42,
    capacity: 12,
    visitorsWeek: 12,
    detectedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A new itinerary or AR experience is available.
 *
 * Owner: `tourism` (Tunisia Immersive Tourism OS) — no other service may publish this.
 */
export const TourismExperiencePublishedV1 = defineEvent({
  type: 'tourism.experience.published.v1',
  owner: 'tourism',
  summary: 'A new itinerary or AR experience is available.',
  tags: ['tourism'],
  payload: z.object({
    experienceId: z.string(),
    title: z.string(),
    governorate: z.string(),
    sites: z.array(z.string()),
    durationHours: z.number().int(),
    publishedAt: z.string(),
  }),
  example: {
    experienceId: 'experience_0001',
    title: 'title-sample',
    governorate: 'TN-11',
    sites: ['site-a', 'site-b'],
    durationHours: 12,
    publishedAt: '2026-08-28T09:00:00.000Z',
  },
});
