/**
 * DOMAIN MODEL — Tunisia Cultural Intelligence Network
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'assets';
export const ENTITY_LABEL = 'Cultural asset';

export const Asset = z.object({
  id: z.string(),
  label: z.string(),
  assetType: z.enum(['monument', 'museum', 'manuscript', 'craft', 'performance', 'site', 'archive']),
  governorate: z.string(),
  location: GeoLocation,
  period: z.string(),
  conditionIndex: z.number().min(0).max(1),
  visitorsMonth: z.number().int(),
  digitised: z.boolean(),
  protectionStatus: z.enum(['none', 'national', 'unesco', 'at-risk']),
  synthetic: z.boolean().default(true),
});
export type Asset = z.infer<typeof Asset>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const AssetInput = Asset.omit({ id: true, synthetic: true }).partial();
export type AssetInput = z.infer<typeof AssetInput>;

export const MODULES = [
  {
    id: 'tunisia-cultural-digital-twin',
    name: 'Tunisia Cultural Digital Twin',
    purpose: 'Condition and use of every cultural asset.',
  },
  {
    id: 'immersive-tunisia',
    name: 'Immersive Tunisia',
    purpose: 'Digitised works and immersive access.',
  },
  {
    id: 'creative-economy-ai-network',
    name: 'Creative Economy AI Network',
    purpose: 'Creative activity, audience and revenue.',
  },
] as const;

export const PUBLISHES = [
  'culture.asset-condition.updated.v1',
  'culture.event.scheduled.v1',
  'culture.creative-economy.updated.v1',
] as const;

export const CONSUMES = [
  'iot.sensor.observation.v1',
  'environment.air-quality.updated.v1',
  'environment.climate-risk.updated.v1',
  'tourism.visitor-flow.updated.v1',
  'tourism.site-pressure.detected.v1',
  'heritage.site-condition.updated.v1',
  'infrastructure.failure.predicted.v1',
  'transport.mobility-demand.updated.v1',
  'education.program.updated.v1',
  'skills.gap.detected.v1',
  'treasury.funding.approved.v1',
  'emergency.incident.created.v1',
  'research.finding.released.v1',
  'global.opportunity.published.v1',
] as const;
