/**
 * EVENT CONTRACTS — Industrial & Energy Intelligence Grid
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
 * Load, generation and renewable share at a grid node.
 *
 * Owner: `industrial-energy` (Industrial & Energy Intelligence Grid) — no other service may publish this.
 */
export const EnergyGridLoadUpdatedV1 = defineEvent({
  type: 'energy.grid-load.updated.v1',
  owner: 'industrial-energy',
  summary: 'Load, generation and renewable share at a grid node.',
  tags: ['industrial-energy'],
  payload: z.object({
    nodeId: z.string(),
    governorate: z.string(),
    loadMw: z.number(),
    generationMw: z.number(),
    renewableShare: z.number().min(0).max(1),
    observedAt: z.string(),
  }),
  example: {
    nodeId: 'node_0001',
    governorate: 'TN-11',
    loadMw: 42.5,
    generationMw: 42.5,
    renewableShare: 0.42,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A node is at risk of failing to serve its load.
 *
 * Owner: `industrial-energy` (Industrial & Energy Intelligence Grid) — no other service may publish this.
 */
export const EnergyOutageRiskFlaggedV1 = defineEvent({
  type: 'energy.outage-risk.flagged.v1',
  owner: 'industrial-energy',
  summary: 'A node is at risk of failing to serve its load.',
  tags: ['industrial-energy'],
  payload: z.object({
    nodeId: z.string(),
    governorate: z.string(),
    riskScore: z.number().min(0).max(1),
    expectedShortfallMw: z.number(),
    horizonHours: z.number().int(),
    flaggedAt: z.string(),
  }),
  example: {
    nodeId: 'node_0001',
    governorate: 'TN-11',
    riskScore: 0.42,
    expectedShortfallMw: 42.5,
    horizonHours: 12,
    flaggedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Production changed at an industrial asset.
 *
 * Owner: `industrial-energy` (Industrial & Energy Intelligence Grid) — no other service may publish this.
 */
export const IndustryProductionUpdatedV1 = defineEvent({
  type: 'industry.production.updated.v1',
  owner: 'industrial-energy',
  summary: 'Production changed at an industrial asset.',
  tags: ['industrial-energy'],
  payload: z.object({
    assetId: z.string(),
    sector: z.string(),
    governorate: z.string(),
    outputTonnesDay: z.number(),
    energyLoadMw: z.number(),
    updatedAt: z.string(),
  }),
  example: {
    assetId: 'asset_0001',
    sector: 'sector-sample',
    governorate: 'TN-11',
    outputTonnesDay: 42.5,
    energyLoadMw: 42.5,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * One plant waste stream was matched to another plant input.
 *
 * Owner: `industrial-energy` (Industrial & Energy Intelligence Grid) — no other service may publish this.
 */
export const IndustrySymbiosisMatchedV1 = defineEvent({
  type: 'industry.symbiosis.matched.v1',
  owner: 'industrial-energy',
  summary: 'One plant waste stream was matched to another plant input.',
  tags: ['industrial-energy'],
  payload: z.object({
    matchId: z.string(),
    sourceAssetId: z.string(),
    targetAssetId: z.string(),
    stream: z.string(),
    tonnesPerYear: z.number(),
    governorate: z.string(),
    matchedAt: z.string(),
  }),
  example: {
    matchId: 'match_0001',
    sourceAssetId: 'sourceAsset_0001',
    targetAssetId: 'targetAsset_0001',
    stream: 'stream-sample',
    tonnesPerYear: 42.5,
    governorate: 'TN-11',
    matchedAt: '2026-08-28T09:00:00.000Z',
  },
});
