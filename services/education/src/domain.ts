/**
 * DOMAIN MODEL — Adaptive Education OS
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'schools';
export const ENTITY_LABEL = 'School';

export const School = z.object({
  id: z.string(),
  label: z.string(),
  level: z.enum(['primary', 'secondary', 'vocational', 'university']),
  governorate: z.string(),
  location: GeoLocation,
  pupils: z.number().int(),
  teachers: z.number().int(),
  buildingCondition: z.number().min(0).max(1),
  airQualityIndex: z.number(),
  digitalReadiness: z.number().min(0).max(1),
  dropoutRate: z.number().min(0).max(1),
  synthetic: z.boolean().default(true),
});
export type School = z.infer<typeof School>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const SchoolInput = School.omit({ id: true, synthetic: true }).partial();
export type SchoolInput = z.infer<typeof SchoolInput>;

export const MODULES = [
  {
    id: 'student-learning-twin',
    name: 'Student Learning Twin',
    purpose: 'Cohort-level mastery and progression, never a named pupil.',
  },
  {
    id: 'smart-school-iot',
    name: 'Smart School IoT',
    purpose: 'Air quality, occupancy and building condition per school.',
  },
  {
    id: 'national-knowledge-graph',
    name: 'National Knowledge Graph',
    purpose: 'Concepts, prerequisites and programme coverage.',
  },
] as const;

export const PUBLISHES = [
  'education.learning-progress.updated.v1',
  'education.program.updated.v1',
  'education.school-condition.updated.v1',
] as const;

export const CONSUMES = [
  'skills.gap.detected.v1',
  'iot.sensor.observation.v1',
  'environment.air-quality.updated.v1',
  'infrastructure.asset-health.updated.v1',
  'infrastructure.failure.predicted.v1',
  'social.vulnerability.updated.v1',
  'research.finding.released.v1',
  'treasury.budget-line.updated.v1',
  'health.epidemic-signal.detected.v1',
  'transport.mobility-demand.updated.v1',
  'culture.event.scheduled.v1',
  'industry.production.updated.v1',
  'resilience.crisis.declared.v1',
  'talent.facility-usage.updated.v1',
] as const;
