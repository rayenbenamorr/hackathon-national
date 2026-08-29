/**
 * EVENT CONTRACTS — National Land Intelligence System
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
 * A parcel record changed.
 *
 * Owner: `land` (National Land Intelligence System) — no other service may publish this.
 */
export const LandParcelUpdatedV1 = defineEvent({
  type: 'land.parcel.updated.v1',
  owner: 'land',
  summary: 'A parcel record changed.',
  tags: ['land'],
  payload: z.object({
    parcelId: z.string(),
    governorate: z.string(),
    zoning: z.string(),
    areaHectares: z.number(),
    ownership: z.string(),
    updatedAt: z.string(),
  }),
  example: {
    parcelId: 'parcel_0001',
    governorate: 'TN-11',
    zoning: 'zoning-sample',
    areaHectares: 42.5,
    ownership: 'ownership-sample',
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Zoning changed — several ministries must re-plan.
 *
 * Owner: `land` (National Land Intelligence System) — no other service may publish this.
 */
export const LandZoningChangedV1 = defineEvent({
  type: 'land.zoning.changed.v1',
  owner: 'land',
  summary: 'Zoning changed — several ministries must re-plan.',
  tags: ['land'],
  payload: z.object({
    parcelId: z.string(),
    governorate: z.string(),
    previousZoning: z.string(),
    newZoning: z.string(),
    reason: z.string(),
    changedAt: z.string(),
  }),
  example: {
    parcelId: 'parcel_0001',
    governorate: 'TN-11',
    previousZoning: 'previousZoning-sample',
    newZoning: 'newZoning-sample',
    reason: 'Synthetic example value for reason.',
    changedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A site was scored for a proposed use.
 *
 * Owner: `land` (National Land Intelligence System) — no other service may publish this.
 */
export const LandSiteSuitabilityScoredV1 = defineEvent({
  type: 'land.site-suitability.scored.v1',
  owner: 'land',
  summary: 'A site was scored for a proposed use.',
  tags: ['land'],
  payload: z.object({
    evaluationId: z.string(),
    parcelId: z.string(),
    proposedUse: z.string(),
    governorate: z.string(),
    score: z.number().min(0).max(1),
    constraints: z.array(z.string()),
    scoredAt: z.string(),
  }),
  example: {
    evaluationId: 'evaluation_0001',
    parcelId: 'parcel_0001',
    proposedUse: 'proposedUse-sample',
    governorate: 'TN-11',
    score: 0.42,
    constraints: ['flood-risk', 'water-availability'],
    scoredAt: '2026-08-28T09:00:00.000Z',
  },
});
