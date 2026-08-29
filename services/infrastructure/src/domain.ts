/**
 * DOMAIN MODEL — Smart Infrastructure OS
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'assets';
export const ENTITY_LABEL = 'Infrastructure asset';

export const Asset = z.object({
  id: z.string(),
  label: z.string(),
  assetType: z.enum([
    'road',
    'bridge',
    'water-network',
    'sewage',
    'power-line',
    'port',
    'rail',
    'building',
    'dam',
    'telecom-site',
  ]),
  governorate: z.string(),
  location: GeoLocation,
  commissionedYear: z.number().int(),
  healthIndex: z.number().min(0).max(1),
  criticality: z.enum(['low', 'medium', 'high', 'vital']),
  lastInspection: z.string(),
  strainMicro: z.number(),
  synthetic: z.boolean().default(true),
});
export type Asset = z.infer<typeof Asset>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const AssetInput = Asset.omit({ id: true, synthetic: true }).partial();
export type AssetInput = z.infer<typeof AssetInput>;

export const MODULES = [
  {
    id: 'national-infrastructure-digital-twin',
    name: 'National Infrastructure Digital Twin',
    purpose: 'Health per asset, continuously.',
  },
  {
    id: 'predictive-infrastructure-maintenance',
    name: 'Predictive Infrastructure Maintenance',
    purpose: 'Failure prediction and work orders.',
  },
  {
    id: 'autonomous-smart-housing',
    name: 'Autonomous Smart Housing',
    purpose: 'Public housing comfort, energy and water.',
  },
] as const;

export const PUBLISHES = [
  'infrastructure.asset-health.updated.v1',
  'infrastructure.failure.predicted.v1',
  'infrastructure.maintenance.scheduled.v1',
] as const;

export const CONSUMES = [
  'iot.sensor.observation.v1',
  'environment.climate-risk.updated.v1',
  'environment.water-quality.updated.v1',
  'transport.mobility-demand.updated.v1',
  'transport.congestion.detected.v1',
  'emergency.incident.created.v1',
  'energy.grid-load.updated.v1',
  'agriculture.water-demand.predicted.v1',
  'treasury.funding.approved.v1',
  'resilience.crisis.declared.v1',
  'land.zoning.changed.v1',
  'education.school-condition.updated.v1',
  'health.capacity.updated.v1',
  'heritage.site-condition.updated.v1',
  'tourism.site-pressure.detected.v1',
] as const;
