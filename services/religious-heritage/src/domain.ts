/**
 * DOMAIN MODEL — Smart Religious Heritage Network
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'sites';
export const ENTITY_LABEL = 'Heritage site';

export const Site = z.object({
  id: z.string(),
  label: z.string(),
  siteType: z.enum(['mosque', 'zaouia', 'madrasa', 'library', 'cemetery', 'shrine']),
  governorate: z.string(),
  location: GeoLocation,
  builtCentury: z.number().int(),
  conditionIndex: z.number().min(0).max(1),
  humidityPct: z.number(),
  vibrationMmS: z.number(),
  energyKwhMonth: z.number(),
  visitorsWeek: z.number().int(),
  synthetic: z.boolean().default(true),
});
export type Site = z.infer<typeof Site>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const SiteInput = Site.omit({ id: true, synthetic: true }).partial();
export type SiteInput = z.infer<typeof SiteInput>;

export const MODULES = [
  {
    id: 'smart-heritage-sensor-network',
    name: 'Smart Heritage Sensor Network',
    purpose: 'Humidity, strain and vibration on fragile fabric.',
  },
  {
    id: 'smart-building-energy-system',
    name: 'Smart Building / Energy System',
    purpose: 'Consumption and comfort in places of worship.',
  },
  {
    id: 'trusted-knowledge-graph',
    name: 'Trusted Knowledge Graph',
    purpose: 'Sourced, verifiable knowledge — never generated assertion.',
  },
] as const;

export const PUBLISHES = [
  'heritage.site-condition.updated.v1',
  'heritage.energy-usage.updated.v1',
  'heritage.knowledge.published.v1',
] as const;

export const CONSUMES = [
  'iot.sensor.observation.v1',
  'environment.air-quality.updated.v1',
  'environment.climate-risk.updated.v1',
  'infrastructure.failure.predicted.v1',
  'infrastructure.maintenance.scheduled.v1',
  'energy.grid-load.updated.v1',
  'culture.asset-condition.updated.v1',
  'tourism.visitor-flow.updated.v1',
  'tourism.site-pressure.detected.v1',
  'transport.mobility-demand.updated.v1',
  'research.finding.released.v1',
  'emergency.incident.created.v1',
  'treasury.funding.approved.v1',
  'education.program.updated.v1',
  'resilience.crisis.declared.v1',
  'land.zoning.changed.v1',
  'social.vulnerability.updated.v1',
  'twin.state.updated.v1',
] as const;
