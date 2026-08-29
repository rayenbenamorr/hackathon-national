/**
 * DOMAIN MODEL — National Skills & Opportunity OS
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';

export const COLLECTION = 'skills';
export const ENTITY_LABEL = 'Skill';

export const Skill = z.object({
  id: z.string(),
  label: z.string(),
  domain: z.enum([
    'water',
    'energy',
    'health',
    'digital',
    'logistics',
    'agriculture',
    'construction',
    'tourism',
    'education',
    'finance',
  ]),
  governorate: z.string(),
  supplyIndex: z.number().min(0).max(1),
  demandIndex: z.number().min(0).max(1),
  gap: z.number(),
  trainingMonths: z.number().int(),
  adjacentSkills: z.array(z.string()),
  synthetic: z.boolean().default(true),
});
export type Skill = z.infer<typeof Skill>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const SkillInput = Skill.omit({ id: true, synthetic: true }).partial();
export type SkillInput = z.infer<typeof SkillInput>;

export const MODULES = [
  {
    id: 'national-skills-graph',
    name: 'National Skills Graph',
    purpose: 'Skills, adjacencies and regional supply.',
  },
  {
    id: 'ai-career-digital-twin',
    name: 'AI Career Digital Twin',
    purpose: 'A path from where a person is to where demand is.',
  },
  {
    id: 'national-micro-mission-network',
    name: 'National Micro-Mission Network',
    purpose: 'Short, real assignments published against detected gaps.',
  },
] as const;

export const PUBLISHES = [
  'skills.gap.detected.v1',
  'skills.micro-mission.published.v1',
  'skills.profile.updated.v1',
] as const;

export const CONSUMES = [
  'education.program.updated.v1',
  'education.learning-progress.updated.v1',
  'research.project.published.v1',
  'research.transfer.matched.v1',
  'industry.production.updated.v1',
  'agriculture.yield.forecast.v1',
  'trade.export-opportunity.detected.v1',
  'infrastructure.maintenance.scheduled.v1',
  'health.capacity.updated.v1',
  'treasury.funding.approved.v1',
  'tourism.visitor-flow.updated.v1',
  'global.diaspora-signal.updated.v1',
  'talent.performance.updated.v1',
  'social.vulnerability.updated.v1',
] as const;
