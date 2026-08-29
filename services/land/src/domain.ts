/**
 * DOMAIN MODEL — National Land Intelligence System
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'parcels';
export const ENTITY_LABEL = 'Land parcel';

export const Parcel = z.object({
  id: z.string(),
  label: z.string(),
  zoning: z.enum([
    'agricultural',
    'residential',
    'industrial',
    'protected',
    'touristic',
    'public',
    'unzoned',
  ]),
  governorate: z.string(),
  location: GeoLocation,
  areaHectares: z.number(),
  ownership: z.enum(['public', 'private', 'collective', 'unknown']),
  currentUse: z.string(),
  suitabilityScore: z.number().min(0).max(1),
  floodRisk: z.number().min(0).max(1),
  synthetic: z.boolean().default(true),
});
export type Parcel = z.infer<typeof Parcel>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const ParcelInput = Parcel.omit({ id: true, synthetic: true }).partial();
export type ParcelInput = z.infer<typeof ParcelInput>;

export const MODULES = [
  {
    id: 'tunisia-land-digital-twin',
    name: 'Tunisia Land Digital Twin',
    purpose: 'Parcels, zoning and current use.',
  },
  {
    id: 'ai-site-planner',
    name: 'AI Site Planner',
    purpose: 'Multi-criteria site suitability scoring.',
  },
  {
    id: 'public-asset-intelligence',
    name: 'Public Asset Intelligence',
    purpose: 'What the State owns and whether it is used.',
  },
] as const;

export const PUBLISHES = [
  'land.parcel.updated.v1',
  'land.zoning.changed.v1',
  'land.site-suitability.scored.v1',
] as const;

export const CONSUMES = [
  'environment.climate-risk.updated.v1',
  'environment.air-quality.updated.v1',
  'agriculture.water-demand.predicted.v1',
  'agriculture.water-shortage.predicted.v1',
  'infrastructure.asset-health.updated.v1',
  'transport.mobility-demand.updated.v1',
  'industry.production.updated.v1',
  'emergency.incident.created.v1',
  'resilience.crisis.declared.v1',
  'treasury.budget-line.updated.v1',
  'tourism.site-pressure.detected.v1',
  'culture.asset-condition.updated.v1',
  'education.school-condition.updated.v1',
  'twin.scenario.completed.v1',
] as const;
