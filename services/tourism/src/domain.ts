/**
 * DOMAIN MODEL — Tunisia Immersive Tourism OS
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'sites';
export const ENTITY_LABEL = 'Tourism site';

export const Site = z.object({
  id: z.string(),
  label: z.string(),
  assetType: z.enum(['hotel', 'beach', 'medina', 'archaeological', 'oasis', 'trail', 'festival', 'museum']),
  governorate: z.string(),
  location: GeoLocation,
  capacity: z.number().int(),
  visitorsWeek: z.number().int(),
  pressureIndex: z.number().min(0).max(1),
  seasonality: z.enum(['year-round', 'summer', 'winter', 'event']),
  arScenes: z.number().int(),
  synthetic: z.boolean().default(true),
});
export type Site = z.infer<typeof Site>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const SiteInput = Site.omit({ id: true, synthetic: true }).partial();
export type SiteInput = z.infer<typeof SiteInput>;

export const MODULES = [
  {
    id: 'tourism-digital-twin',
    name: 'Tourism Digital Twin',
    purpose: 'Site capacity, pressure and seasonality.',
  },
  {
    id: 'ar-tunisia',
    name: 'AR Tunisia',
    purpose: 'Anchored augmented-reality scenes at real sites.',
  },
  {
    id: 'ai-tourism-flow-engine',
    name: 'AI Tourism Flow Engine',
    purpose: 'Itineraries that redistribute pressure.',
  },
] as const;

export const PUBLISHES = [
  'tourism.visitor-flow.updated.v1',
  'tourism.site-pressure.detected.v1',
  'tourism.experience.published.v1',
] as const;

export const CONSUMES = [
  'environment.air-quality.updated.v1',
  'environment.water-quality.updated.v1',
  'environment.climate-risk.updated.v1',
  'culture.event.scheduled.v1',
  'culture.asset-condition.updated.v1',
  'heritage.site-condition.updated.v1',
  'transport.congestion.detected.v1',
  'transport.mobility-demand.updated.v1',
  'health.capacity.updated.v1',
  'emergency.incident.created.v1',
  'iot.sensor.observation.v1',
  'global.diaspora-signal.updated.v1',
  'infrastructure.asset-health.updated.v1',
  'resilience.crisis.declared.v1',
  'talent.facility-usage.updated.v1',
  'treasury.funding.approved.v1',
] as const;
