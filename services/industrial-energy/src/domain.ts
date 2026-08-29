/**
 * DOMAIN MODEL — Industrial & Energy Intelligence Grid
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'assets';
export const ENTITY_LABEL = 'Industrial asset';

export const Asset = z.object({
  id: z.string(),
  label: z.string(),
  sector: z.enum([
    'cement',
    'textile',
    'chemicals',
    'agrifood',
    'mechanical',
    'electronics',
    'phosphate',
    'energy',
  ]),
  governorate: z.string(),
  location: GeoLocation,
  outputTonnesDay: z.number(),
  energyLoadMw: z.number(),
  renewableShare: z.number().min(0).max(1),
  wasteStream: z.string(),
  condition: z.number().min(0).max(1),
  synthetic: z.boolean().default(true),
});
export type Asset = z.infer<typeof Asset>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const AssetInput = Asset.omit({ id: true, synthetic: true }).partial();
export type AssetInput = z.infer<typeof AssetInput>;

export const MODULES = [
  {
    id: 'industrial-digital-twin-network',
    name: 'Industrial Digital Twin Network',
    purpose: 'Twin per industrial asset: output, consumption, condition.',
  },
  {
    id: 'energy-internet',
    name: 'Energy Internet',
    purpose: 'Node-level load, generation and renewable share.',
  },
  {
    id: 'ai-industrial-symbiosis',
    name: 'AI Industrial Symbiosis',
    purpose: 'Matches one plant output stream to another plant input.',
  },
] as const;

export const PUBLISHES = [
  'energy.grid-load.updated.v1',
  'energy.outage-risk.flagged.v1',
  'industry.production.updated.v1',
  'industry.symbiosis.matched.v1',
] as const;

export const CONSUMES = [
  'environment.air-quality.updated.v1',
  'environment.waste-stream.updated.v1',
  'environment.climate-risk.updated.v1',
  'iot.sensor.observation.v1',
  'agriculture.water-demand.predicted.v1',
  'infrastructure.failure.predicted.v1',
  'logistics.freight.updated.v1',
  'trade.supply-risk.flagged.v1',
  'treasury.funding.approved.v1',
  'resilience.crisis.declared.v1',
  'research.finding.released.v1',
  'skills.gap.detected.v1',
  'land.site-suitability.scored.v1',
  'twin.scenario.completed.v1',
] as const;
