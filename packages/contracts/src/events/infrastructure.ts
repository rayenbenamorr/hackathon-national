/**
 * EVENT CONTRACTS — Smart Infrastructure OS
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
 * Health index of an asset changed.
 *
 * Owner: `infrastructure` (Smart Infrastructure OS) — no other service may publish this.
 */
export const InfrastructureAssetHealthUpdatedV1 = defineEvent({
  type: 'infrastructure.asset-health.updated.v1',
  owner: 'infrastructure',
  summary: 'Health index of an asset changed.',
  tags: ['infrastructure'],
  payload: z.object({
    assetId: z.string(),
    assetType: z.string(),
    governorate: z.string(),
    healthIndex: z.number().min(0).max(1),
    criticality: z.string(),
    observedAt: z.string(),
  }),
  example: {
    assetId: 'asset_0001',
    assetType: 'assetType-sample',
    governorate: 'TN-11',
    healthIndex: 0.42,
    criticality: 'criticality-sample',
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * An asset is predicted to fail within a horizon.
 *
 * Owner: `infrastructure` (Smart Infrastructure OS) — no other service may publish this.
 */
export const InfrastructureFailurePredictedV1 = defineEvent({
  type: 'infrastructure.failure.predicted.v1',
  owner: 'infrastructure',
  summary: 'An asset is predicted to fail within a horizon.',
  tags: ['infrastructure'],
  payload: z.object({
    predictionId: z.string(),
    assetId: z.string(),
    assetType: z.string(),
    governorate: z.string(),
    horizonDays: z.number().int(),
    probability: z.number().min(0).max(1),
    consequence: z.string(),
    predictedAt: z.string(),
  }),
  example: {
    predictionId: 'prediction_0001',
    assetId: 'asset_0001',
    assetType: 'assetType-sample',
    governorate: 'TN-11',
    horizonDays: 12,
    probability: 0.42,
    consequence: 'Synthetic example value for consequence.',
    predictedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A work order was scheduled.
 *
 * Owner: `infrastructure` (Smart Infrastructure OS) — no other service may publish this.
 */
export const InfrastructureMaintenanceScheduledV1 = defineEvent({
  type: 'infrastructure.maintenance.scheduled.v1',
  owner: 'infrastructure',
  summary: 'A work order was scheduled.',
  tags: ['infrastructure'],
  payload: z.object({
    orderId: z.string(),
    assetId: z.string(),
    governorate: z.string(),
    scheduledFor: z.string(),
    estimatedCostTnd: z.number(),
    priority: z.enum(['low', 'standard', 'high', 'emergency']),
  }),
  example: {
    orderId: 'order_0001',
    assetId: 'asset_0001',
    governorate: 'TN-11',
    scheduledFor: '2026-08-28T09:00:00.000Z',
    estimatedCostTnd: 42.5,
    priority: 'low',
  },
});
