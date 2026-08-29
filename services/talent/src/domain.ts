/**
 * DOMAIN MODEL — National Talent Intelligence Network
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'facilities';
export const ENTITY_LABEL = 'Sports facility';

export const Facility = z.object({
  id: z.string(),
  label: z.string(),
  facilityType: z.enum(['stadium', 'gymnasium', 'pool', 'athletics-track', 'training-centre', 'youth-club']),
  governorate: z.string(),
  location: GeoLocation,
  capacity: z.number().int(),
  weeklyUsers: z.number().int(),
  condition: z.number().min(0).max(1),
  energyKwhMonth: z.number(),
  disciplines: z.array(z.string()),
  synthetic: z.boolean().default(true),
});
export type Facility = z.infer<typeof Facility>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const FacilityInput = Facility.omit({ id: true, synthetic: true }).partial();
export type FacilityInput = z.infer<typeof FacilityInput>;

export const MODULES = [
  {
    id: 'athlete-digital-twin',
    name: 'Athlete Digital Twin',
    purpose: 'Load, performance and injury risk from wearable signals.',
  },
  {
    id: 'smart-sports-infrastructure-grid',
    name: 'Smart Sports Infrastructure Grid',
    purpose: 'Facility usage, condition and energy.',
  },
  {
    id: 'youth-opportunity-ai',
    name: 'Youth Opportunity AI',
    purpose: 'Connects young people to missions, training and clubs.',
  },
] as const;

export const PUBLISHES = [
  'talent.performance.updated.v1',
  'talent.facility-usage.updated.v1',
  'talent.injury-risk.flagged.v1',
] as const;

export const CONSUMES = [
  'iot.sensor.observation.v1',
  'health.capacity.updated.v1',
  'education.learning-progress.updated.v1',
  'education.school-condition.updated.v1',
  'environment.air-quality.updated.v1',
  'environment.climate-risk.updated.v1',
  'infrastructure.asset-health.updated.v1',
  'energy.grid-load.updated.v1',
  'social.vulnerability.updated.v1',
  'skills.micro-mission.published.v1',
  'culture.event.scheduled.v1',
  'transport.mobility-demand.updated.v1',
  'emergency.incident.created.v1',
  'treasury.budget-line.updated.v1',
] as const;
