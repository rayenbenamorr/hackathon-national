/**
 * DOMAIN MODEL — Life & Care Intelligence OS
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'facilities';
export const ENTITY_LABEL = 'Care facility';

export const Facility = z.object({
  id: z.string(),
  label: z.string(),
  facilityType: z.enum(['nursery', 'childrens-centre', 'womens-centre', 'elder-home', 'day-care', 'shelter']),
  governorate: z.string(),
  location: GeoLocation,
  capacity: z.number().int(),
  occupied: z.number().int(),
  waitingList: z.number().int(),
  independenceScore: z.number().min(0).max(1),
  services: z.array(z.string()),
  synthetic: z.boolean().default(true),
});
export type Facility = z.infer<typeof Facility>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const FacilityInput = Facility.omit({ id: true, synthetic: true }).partial();
export type FacilityInput = z.infer<typeof FacilityInput>;

export const MODULES = [
  {
    id: 'life-journey-ai',
    name: 'Life Journey AI',
    purpose: 'Life events and the support each one should trigger.',
  },
  {
    id: 'smart-care-network',
    name: 'Smart Care Network',
    purpose: 'Care facilities, capacity and coverage.',
  },
  {
    id: 'economic-independence-engine',
    name: 'Economic Independence Engine',
    purpose: 'The concrete path from support to autonomy.',
  },
] as const;

export const PUBLISHES = [
  'care.life-event.recorded.v1',
  'care.support-need.detected.v1',
  'care.facility-capacity.updated.v1',
] as const;

export const CONSUMES = [
  'social.vulnerability.updated.v1',
  'social.household-need.detected.v1',
  'health.capacity.updated.v1',
  'health.care-episode.updated.v1',
  'education.learning-progress.updated.v1',
  'skills.micro-mission.published.v1',
  'treasury.aid.disbursed.v1',
  'justice.case.filed.v1',
  'emergency.incident.created.v1',
  'resilience.crisis.declared.v1',
  'environment.climate-risk.updated.v1',
  'transport.mobility-demand.updated.v1',
  'culture.event.scheduled.v1',
  'talent.facility-usage.updated.v1',
] as const;
