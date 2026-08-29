/**
 * DOMAIN MODEL — Social Mobility OS
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';

export const COLLECTION = 'cohorts';
export const ENTITY_LABEL = 'Household cohort';

export const Cohort = z.object({
  id: z.string(),
  label: z.string(),
  governorate: z.string(),
  size: z.number().int(),
  vulnerabilityIndex: z.number().min(0).max(1),
  employmentRate: z.number().min(0).max(1),
  schoolingRate: z.number().min(0).max(1),
  healthAccess: z.number().min(0).max(1),
  housingQuality: z.number().min(0).max(1),
  benefitsActive: z.number().int(),
  synthetic: z.boolean().default(true),
});
export type Cohort = z.infer<typeof Cohort>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const CohortInput = Cohort.omit({ id: true, synthetic: true }).partial();
export type CohortInput = z.infer<typeof CohortInput>;

export const MODULES = [
  {
    id: 'social-digital-twin',
    name: 'Social Digital Twin',
    purpose: 'Vulnerability per household cohort, continuously updated.',
  },
  {
    id: 'zero-form-social-services',
    name: 'Zero-Form Social Services',
    purpose: 'Eligibility computed from existing signals.',
  },
  {
    id: 'social-mobility-ai',
    name: 'Social Mobility AI',
    purpose: 'What actually moves a cohort upward, by governorate.',
  },
] as const;

export const PUBLISHES = [
  'social.vulnerability.updated.v1',
  'social.benefit.granted.v1',
  'social.household-need.detected.v1',
] as const;

export const CONSUMES = [
  'health.capacity.updated.v1',
  'health.epidemic-signal.detected.v1',
  'education.learning-progress.updated.v1',
  'education.school-condition.updated.v1',
  'agriculture.water-shortage.predicted.v1',
  'energy.outage-risk.flagged.v1',
  'treasury.aid.disbursed.v1',
  'skills.gap.detected.v1',
  'transport.mobility-demand.updated.v1',
  'care.support-need.detected.v1',
  'emergency.incident.created.v1',
  'resilience.crisis.declared.v1',
  'infrastructure.asset-health.updated.v1',
  'justice.case.filed.v1',
] as const;
