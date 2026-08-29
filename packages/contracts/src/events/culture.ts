/**
 * EVENT CONTRACTS — Tunisia Cultural Intelligence Network
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
 * Condition of a cultural asset changed.
 *
 * Owner: `culture` (Tunisia Cultural Intelligence Network) — no other service may publish this.
 */
export const CultureAssetConditionUpdatedV1 = defineEvent({
  type: 'culture.asset-condition.updated.v1',
  owner: 'culture',
  summary: 'Condition of a cultural asset changed.',
  tags: ['culture'],
  payload: z.object({
    assetId: z.string(),
    governorate: z.string(),
    conditionIndex: z.number().min(0).max(1),
    protectionStatus: z.string(),
    observedAt: z.string(),
  }),
  example: {
    assetId: 'asset_0001',
    governorate: 'TN-11',
    conditionIndex: 0.42,
    protectionStatus: 'protectionStatus-sample',
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A cultural event was scheduled — mobility, safety and tourism plan against it.
 *
 * Owner: `culture` (Tunisia Cultural Intelligence Network) — no other service may publish this.
 */
export const CultureEventScheduledV1 = defineEvent({
  type: 'culture.event.scheduled.v1',
  owner: 'culture',
  summary: 'A cultural event was scheduled — mobility, safety and tourism plan against it.',
  tags: ['culture'],
  payload: z.object({
    eventId: z.string(),
    title: z.string(),
    governorate: z.string(),
    location: GeoLocation,
    expectedAttendance: z.number().int(),
    startsAt: z.string(),
  }),
  example: {
    eventId: 'event_0001',
    title: 'title-sample',
    governorate: 'TN-11',
    location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
    expectedAttendance: 12,
    startsAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Creative activity and revenue for a governorate.
 *
 * Owner: `culture` (Tunisia Cultural Intelligence Network) — no other service may publish this.
 */
export const CultureCreativeEconomyUpdatedV1 = defineEvent({
  type: 'culture.creative-economy.updated.v1',
  owner: 'culture',
  summary: 'Creative activity and revenue for a governorate.',
  tags: ['culture'],
  payload: z.object({
    governorate: z.string(),
    activeCreators: z.number().int(),
    revenueTnd: z.number(),
    dominantDiscipline: z.string(),
    updatedAt: z.string(),
  }),
  example: {
    governorate: 'TN-11',
    activeCreators: 12,
    revenueTnd: 42.5,
    dominantDiscipline: 'dominantDiscipline-sample',
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});
