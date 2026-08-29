/**
 * DOMAIN MODEL — National Safety & Emergency Grid
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'incidents';
export const ENTITY_LABEL = 'Incident';

export const Incident = z.object({
  id: z.string(),
  label: z.string(),
  incidentType: z.enum([
    'road-accident',
    'fire',
    'flood',
    'medical',
    'industrial',
    'power-outage',
    'water-outage',
    'security',
    'environmental',
  ]),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']),
  status: z.enum(['open', 'dispatched', 'contained', 'resolved']),
  location: GeoLocation,
  governorate: z.string(),
  declaredAt: z.string(),
  casualties: z.number().int(),
  synthetic: z.boolean().default(true),
});
export type Incident = z.infer<typeof Incident>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const IncidentInput = Incident.omit({ id: true, synthetic: true }).partial();
export type IncidentInput = z.infer<typeof IncidentInput>;

export const MODULES = [
  {
    id: 'national-emergency-brain',
    name: 'National Emergency Brain',
    purpose: 'Triage, severity and the dispatch decision.',
  },
  {
    id: 'ai-road-safety-grid',
    name: 'AI Road Safety Grid',
    purpose: 'Continuous risk scoring of road segments.',
  },
  {
    id: 'smart-civil-services',
    name: 'Smart Civil Services',
    purpose: 'Civil requests that do not need an emergency response.',
  },
] as const;

export const PUBLISHES = [
  'emergency.incident.created.v1',
  'emergency.incident.resolved.v1',
  'emergency.resource.requested.v1',
  'emergency.road-risk.updated.v1',
] as const;

export const CONSUMES = [
  'health.capacity.updated.v1',
  'health.emergency.declared.v1',
  'transport.congestion.detected.v1',
  'environment.air-quality.updated.v1',
  'iot.sensor.observation.v1',
  'infrastructure.failure.predicted.v1',
  'water.reservoir-level.updated.v1',
  'industry.production.updated.v1',
  'resilience.crisis.declared.v1',
  'culture.event.scheduled.v1',
  'tourism.visitor-flow.updated.v1',
  'talent.facility-usage.updated.v1',
  'education.school-condition.updated.v1',
  'social.vulnerability.updated.v1',
] as const;
