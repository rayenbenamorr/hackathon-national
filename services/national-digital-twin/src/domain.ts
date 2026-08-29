/**
 * DOMAIN MODEL — Tunisia National Digital Twin
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';

export const COLLECTION = 'regionStates';
export const ENTITY_LABEL = 'Region state';

export const RegionState = z.object({
  id: z.string(),
  label: z.string(),
  governorate: z.string(),
  population: z.number().int(),
  stressIndex: z.number().min(0).max(1),
  waterStress: z.number().min(0).max(1),
  airQualityIndex: z.number(),
  healthLoad: z.number().min(0).max(1),
  mobilityPressure: z.number().min(0).max(1),
  economicActivity: z.number().min(0).max(1),
  updatedAt: z.string(),
  synthetic: z.boolean().default(true),
});
export type RegionState = z.infer<typeof RegionState>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const RegionStateInput = RegionState.omit({ id: true, synthetic: true }).partial();
export type RegionStateInput = z.infer<typeof RegionStateInput>;

export const MODULES = [
  {
    id: 'tunisia-digital-twin',
    name: 'Tunisia Digital Twin',
    purpose: 'Regional state assembled from every ministry signal.',
  },
  {
    id: 'national-scenario-engine',
    name: 'National Scenario Engine',
    purpose: 'What-if simulation across sectors.',
  },
  {
    id: 'regional-ai-planner',
    name: 'Regional AI Planner',
    purpose: 'Investment and priority proposals per governorate.',
  },
] as const;

export const PUBLISHES = [
  'twin.state.updated.v1',
  'twin.scenario.completed.v1',
  'twin.anomaly.detected.v1',
] as const;

export const CONSUMES = [
  'environment.air-quality.updated.v1',
  'environment.climate-risk.updated.v1',
  'agriculture.water-demand.predicted.v1',
  'agriculture.water-shortage.predicted.v1',
  'health.capacity.updated.v1',
  'transport.mobility-demand.updated.v1',
  'energy.grid-load.updated.v1',
  'infrastructure.asset-health.updated.v1',
  'social.vulnerability.updated.v1',
  'emergency.incident.created.v1',
  'resilience.crisis.declared.v1',
  'education.school-condition.updated.v1',
  'land.zoning.changed.v1',
  'tourism.visitor-flow.updated.v1',
  'treasury.fiscal-risk.flagged.v1',
  'iot.sensor.observation.v1',
  'trade.shipment.updated.v1',
  'skills.gap.detected.v1',
  'culture.creative-economy.updated.v1',
  'care.facility-capacity.updated.v1',
] as const;
