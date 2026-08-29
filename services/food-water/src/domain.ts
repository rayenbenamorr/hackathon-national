/**
 * DOMAIN MODEL — Autonomous Food & Water Grid
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'farms';
export const ENTITY_LABEL = 'Farm';

export const Farm = z.object({
  id: z.string(),
  label: z.string(),
  crop: z.enum(['olive', 'date', 'cereal', 'citrus', 'vegetable', 'forage', 'vine', 'greenhouse']),
  governorate: z.string(),
  location: GeoLocation,
  areaHectares: z.number(),
  soilMoisturePct: z.number(),
  irrigationType: z.enum(['drip', 'sprinkler', 'flood', 'rainfed']),
  waterDemandM3Day: z.number(),
  yieldForecastTonnes: z.number(),
  stressIndex: z.number().min(0).max(1),
  synthetic: z.boolean().default(true),
});
export type Farm = z.infer<typeof Farm>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const FarmInput = Farm.omit({ id: true, synthetic: true }).partial();
export type FarmInput = z.infer<typeof FarmInput>;

export const MODULES = [
  {
    id: 'autonomous-water-grid',
    name: 'Autonomous Water Grid',
    purpose: 'Reservoirs, networks and demand as one balance.',
  },
  {
    id: 'ai-farm-digital-twin',
    name: 'AI Farm Digital Twin',
    purpose: 'Soil, crop and irrigation state per farm.',
  },
  {
    id: 'smart-ocean-fisheries-network',
    name: 'Smart Ocean & Fisheries Network',
    purpose: 'Stock and effort per fishing zone.',
  },
] as const;

export const PUBLISHES = [
  'agriculture.water-demand.predicted.v1',
  'agriculture.water-shortage.predicted.v1',
  'agriculture.yield.forecast.v1',
  'water.reservoir-level.updated.v1',
  'fisheries.stock.updated.v1',
] as const;

export const CONSUMES = [
  'environment.climate-risk.updated.v1',
  'environment.water-quality.updated.v1',
  'environment.air-quality.updated.v1',
  'iot.sensor.observation.v1',
  'infrastructure.failure.predicted.v1',
  'energy.outage-risk.flagged.v1',
  'land.parcel.updated.v1',
  'land.zoning.changed.v1',
  'treasury.funding.approved.v1',
  'resilience.crisis.declared.v1',
  'trade.export-opportunity.detected.v1',
  'research.finding.released.v1',
  'health.epidemic-signal.detected.v1',
  'twin.state.updated.v1',
] as const;
