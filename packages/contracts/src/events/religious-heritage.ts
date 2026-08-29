/**
 * EVENT CONTRACTS — Smart Religious Heritage Network
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
 * Condition of a heritage site changed.
 *
 * Owner: `religious-heritage` (Smart Religious Heritage Network) — no other service may publish this.
 */
export const HeritageSiteConditionUpdatedV1 = defineEvent({
  type: 'heritage.site-condition.updated.v1',
  owner: 'religious-heritage',
  summary: 'Condition of a heritage site changed.',
  tags: ['religious-heritage'],
  payload: z.object({
    siteId: z.string(),
    governorate: z.string(),
    conditionIndex: z.number().min(0).max(1),
    humidityPct: z.number(),
    vibrationMmS: z.number(),
    observedAt: z.string(),
  }),
  example: {
    siteId: 'site_0001',
    governorate: 'TN-11',
    conditionIndex: 0.42,
    humidityPct: 42.5,
    vibrationMmS: 42.5,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Energy consumption at a site.
 *
 * Owner: `religious-heritage` (Smart Religious Heritage Network) — no other service may publish this.
 */
export const HeritageEnergyUsageUpdatedV1 = defineEvent({
  type: 'heritage.energy-usage.updated.v1',
  owner: 'religious-heritage',
  summary: 'Energy consumption at a site.',
  tags: ['religious-heritage'],
  payload: z.object({
    siteId: z.string(),
    governorate: z.string(),
    energyKwhMonth: z.number(),
    renewableShare: z.number().min(0).max(1),
    observedAt: z.string(),
  }),
  example: {
    siteId: 'site_0001',
    governorate: 'TN-11',
    energyKwhMonth: 42.5,
    renewableShare: 0.42,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A sourced knowledge entry was published.
 *
 * Owner: `religious-heritage` (Smart Religious Heritage Network) — no other service may publish this.
 */
export const HeritageKnowledgePublishedV1 = defineEvent({
  type: 'heritage.knowledge.published.v1',
  owner: 'religious-heritage',
  summary: 'A sourced knowledge entry was published.',
  tags: ['religious-heritage'],
  payload: z.object({
    entryId: z.string(),
    title: z.string(),
    sourceCount: z.number().int(),
    domain: z.string(),
    publishedAt: z.string(),
  }),
  example: {
    entryId: 'entry_0001',
    title: 'title-sample',
    sourceCount: 12,
    domain: 'domain-sample',
    publishedAt: '2026-08-28T09:00:00.000Z',
  },
});
