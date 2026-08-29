/**
 * EVENT CONTRACTS — Autonomous Food & Water Grid
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
 * Forecast water demand for a zone — the canonical cross-ministry forecast on this platform.
 *
 * Owner: `food-water` (Autonomous Food & Water Grid) — no other service may publish this.
 */
export const AgricultureWaterDemandPredictedV1 = defineEvent({
  type: 'agriculture.water-demand.predicted.v1',
  owner: 'food-water',
  summary: 'Forecast water demand for a zone — the canonical cross-ministry forecast on this platform.',
  tags: ['food-water'],
  payload: z.object({
    forecastId: z.string(),
    governorate: z.string(),
    horizonDays: z.number().int(),
    demandM3Day: z.number(),
    confidence: z.number().min(0).max(1),
    drivers: z.array(z.string()),
    predictedAt: z.string(),
  }),
  example: {
    forecastId: 'forecast_0001',
    governorate: 'TN-11',
    horizonDays: 12,
    demandM3Day: 42.5,
    confidence: 0.42,
    drivers: ['drought-index', 'sensor-observations'],
    predictedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A shortage is expected: demand will exceed available supply.
 *
 * Owner: `food-water` (Autonomous Food & Water Grid) — no other service may publish this.
 */
export const AgricultureWaterShortagePredictedV1 = defineEvent({
  type: 'agriculture.water-shortage.predicted.v1',
  owner: 'food-water',
  summary: 'A shortage is expected: demand will exceed available supply.',
  tags: ['food-water'],
  payload: z.object({
    alertId: z.string(),
    governorate: z.string(),
    horizonDays: z.number().int(),
    deficitM3Day: z.number(),
    severity: z.enum(['watch', 'alert', 'critical']),
    affectedFarms: z.number().int(),
    predictedAt: z.string(),
  }),
  example: {
    alertId: 'alert_0001',
    governorate: 'TN-11',
    horizonDays: 12,
    deficitM3Day: 42.5,
    severity: 'watch',
    affectedFarms: 12,
    predictedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Expected yield for a crop in a governorate.
 *
 * Owner: `food-water` (Autonomous Food & Water Grid) — no other service may publish this.
 */
export const AgricultureYieldForecastV1 = defineEvent({
  type: 'agriculture.yield.forecast.v1',
  owner: 'food-water',
  summary: 'Expected yield for a crop in a governorate.',
  tags: ['food-water'],
  payload: z.object({
    forecastId: z.string(),
    crop: z.string(),
    governorate: z.string(),
    expectedTonnes: z.number(),
    varianceFromBaseline: z.number(),
    predictedAt: z.string(),
  }),
  example: {
    forecastId: 'forecast_0001',
    crop: 'crop-sample',
    governorate: 'TN-11',
    expectedTonnes: 42.5,
    varianceFromBaseline: 42.5,
    predictedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Reservoir fill level changed.
 *
 * Owner: `food-water` (Autonomous Food & Water Grid) — no other service may publish this.
 */
export const WaterReservoirLevelUpdatedV1 = defineEvent({
  type: 'water.reservoir-level.updated.v1',
  owner: 'food-water',
  summary: 'Reservoir fill level changed.',
  tags: ['food-water'],
  payload: z.object({
    assetId: z.string(),
    governorate: z.string(),
    fillPct: z.number().min(0).max(1),
    volumeM3: z.number(),
    trend: z.enum(['rising', 'stable', 'falling']),
    observedAt: z.string(),
  }),
  example: {
    assetId: 'asset_0001',
    governorate: 'TN-11',
    fillPct: 0.42,
    volumeM3: 42.5,
    trend: 'rising',
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Stock and fishing effort for a maritime zone.
 *
 * Owner: `food-water` (Autonomous Food & Water Grid) — no other service may publish this.
 */
export const FisheriesStockUpdatedV1 = defineEvent({
  type: 'fisheries.stock.updated.v1',
  owner: 'food-water',
  summary: 'Stock and fishing effort for a maritime zone.',
  tags: ['food-water'],
  payload: z.object({
    zoneId: z.string(),
    species: z.string(),
    stockIndex: z.number().min(0).max(1),
    effortBoats: z.number().int(),
    observedAt: z.string(),
  }),
  example: {
    zoneId: 'zone_0001',
    species: 'species-sample',
    stockIndex: 0.42,
    effortBoats: 12,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});
