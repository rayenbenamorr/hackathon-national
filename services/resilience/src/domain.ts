/**
 * DOMAIN MODEL — National Resilience Command System
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'crises';
export const ENTITY_LABEL = 'Crisis';

export const Cris = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum([
    'flood',
    'drought',
    'earthquake',
    'fire',
    'epidemic',
    'industrial',
    'storm',
    'power-failure',
  ]),
  severity: z.enum(['watch', 'alert', 'major', 'catastrophic']),
  status: z.enum(['declared', 'responding', 'stabilised', 'closed']),
  governorate: z.string(),
  location: GeoLocation,
  declaredAt: z.string(),
  affectedPeople: z.number().int(),
  peopleAtRisk: z.number().int(),
  synthetic: z.boolean().default(true),
});
export type Cris = z.infer<typeof Cris>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const CrisInput = Cris.omit({ id: true, synthetic: true }).partial();
export type CrisInput = z.infer<typeof CrisInput>;

export const MODULES = [
  {
    id: 'national-resilience-digital-twin',
    name: 'National Resilience Digital Twin',
    purpose: 'Live state of every declared crisis and the zones it covers.',
  },
  {
    id: 'autonomous-crisis-logistics',
    name: 'Autonomous Crisis Logistics',
    purpose: 'Turns needs into a resourced, sequenced relief plan.',
  },
  {
    id: 'emergency-mesh-network',
    name: 'Emergency Mesh Network',
    purpose: 'Store-and-forward node health when normal connectivity is gone.',
  },
] as const;

export const PUBLISHES = [
  'resilience.crisis.declared.v1',
  'resilience.relief-plan.updated.v1',
  'resilience.resource-request.created.v1',
  'resilience.mesh-node.status.v1',
] as const;

export const CONSUMES = [
  'emergency.incident.created.v1',
  'environment.climate-risk.updated.v1',
  'agriculture.water-shortage.predicted.v1',
  'health.capacity.updated.v1',
  'infrastructure.failure.predicted.v1',
  'energy.outage-risk.flagged.v1',
  'transport.resource.dispatched.v1',
  'social.vulnerability.updated.v1',
  'iot.sensor.observation.v1',
  'treasury.funding.approved.v1',
  'land.site-suitability.scored.v1',
  'education.school-condition.updated.v1',
  'tourism.site-pressure.detected.v1',
  'twin.anomaly.detected.v1',
] as const;
