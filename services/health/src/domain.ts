/**
 * DOMAIN MODEL — Connected Health Intelligence System
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'facilities';
export const ENTITY_LABEL = 'Health facility';

export const Facility = z.object({
  id: z.string(),
  label: z.string(),
  facilityType: z.enum(['regional-hospital', 'university-hospital', 'health-centre', 'clinic', 'dispensary']),
  governorate: z.string(),
  location: GeoLocation,
  totalBeds: z.number().int(),
  availableBeds: z.number().int(),
  icuAvailable: z.number().int(),
  emergencyLoad: z.number().min(0).max(1),
  specialties: z.array(z.string()),
  synthetic: z.boolean().default(true),
});
export type Facility = z.infer<typeof Facility>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const FacilityInput = Facility.omit({ id: true, synthetic: true }).partial();
export type FacilityInput = z.infer<typeof FacilityInput>;

export const MODULES = [
  {
    id: 'personal-health-digital-twin',
    name: 'Personal Health Digital Twin',
    purpose: 'Pseudonymous cohort twins — never an identified person.',
  },
  {
    id: 'smart-hospital-operating-system',
    name: 'Smart Hospital Operating System',
    purpose: 'Beds, ICU, emergency load, in real time.',
  },
  {
    id: 'healthcare-mesh',
    name: 'Healthcare Mesh',
    purpose: 'Coordination with transport, social services and emergency.',
  },
] as const;

export const PUBLISHES = [
  'health.capacity.updated.v1',
  'health.epidemic-signal.detected.v1',
  'health.emergency.declared.v1',
  'health.care-episode.updated.v1',
] as const;

export const CONSUMES = [
  'environment.air-quality.updated.v1',
  'environment.water-quality.updated.v1',
  'environment.climate-risk.updated.v1',
  'iot.sensor.observation.v1',
  'emergency.incident.created.v1',
  'transport.resource.dispatched.v1',
  'social.vulnerability.updated.v1',
  'agriculture.water-shortage.predicted.v1',
  'education.school-condition.updated.v1',
  'resilience.crisis.declared.v1',
  'care.facility-capacity.updated.v1',
  'energy.outage-risk.flagged.v1',
  'tourism.visitor-flow.updated.v1',
  'talent.injury-risk.flagged.v1',
] as const;
