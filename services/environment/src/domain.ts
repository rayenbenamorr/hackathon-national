/**
 * DOMAIN MODEL — Environmental Nervous System
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'stations';
export const ENTITY_LABEL = 'Environmental station';

export const Station = z.object({
  id: z.string(),
  label: z.string(),
  governorate: z.string(),
  location: GeoLocation,
  pm25: z.number(),
  no2: z.number(),
  waterTurbidity: z.number(),
  noiseDb: z.number(),
  temperature: z.number(),
  climateRisk: z.number().min(0).max(1),
  droughtIndex: z.number().min(0).max(1),
  synthetic: z.boolean().default(true),
});
export type Station = z.infer<typeof Station>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const StationInput = Station.omit({ id: true, synthetic: true }).partial();
export type StationInput = z.infer<typeof StationInput>;

export const MODULES = [
  {
    id: 'national-environmental-sensor-network',
    name: 'National Environmental Sensor Network',
    purpose: 'Air, water and noise observations everywhere.',
  },
  {
    id: 'climate-digital-twin',
    name: 'Climate Digital Twin',
    purpose: 'Projections and climate risk per zone.',
  },
  {
    id: 'circular-resource-ai',
    name: 'Circular Resource AI',
    purpose: 'Waste streams and their possible reuse.',
  },
] as const;

export const PUBLISHES = [
  'environment.air-quality.updated.v1',
  'environment.water-quality.updated.v1',
  'environment.climate-risk.updated.v1',
  'environment.waste-stream.updated.v1',
] as const;

export const CONSUMES = [
  'iot.sensor.observation.v1',
  'industry.production.updated.v1',
  'energy.grid-load.updated.v1',
  'transport.mobility-demand.updated.v1',
  'transport.congestion.detected.v1',
  'agriculture.water-demand.predicted.v1',
  'water.reservoir-level.updated.v1',
  'infrastructure.failure.predicted.v1',
  'emergency.incident.created.v1',
  'trade.product-passport.issued.v1',
  'tourism.site-pressure.detected.v1',
  'land.zoning.changed.v1',
  'resilience.crisis.declared.v1',
  'research.finding.released.v1',
  'culture.event.scheduled.v1',
] as const;
