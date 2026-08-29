/**
 * DOMAIN MODEL — Tunisia Research Brain
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';

export const COLLECTION = 'projects';
export const ENTITY_LABEL = 'Research project';

export const Project = z.object({
  id: z.string(),
  label: z.string(),
  discipline: z.enum([
    'water',
    'energy',
    'health',
    'agronomy',
    'materials',
    'computing',
    'climate',
    'social',
    'marine',
  ]),
  institution: z.string(),
  governorate: z.string(),
  status: z.enum(['proposed', 'running', 'completed', 'transferred']),
  trl: z.number().int(),
  budgetTnd: z.number(),
  keywords: z.array(z.string()),
  synthetic: z.boolean().default(true),
});
export type Project = z.infer<typeof Project>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const ProjectInput = Project.omit({ id: true, synthetic: true }).partial();
export type ProjectInput = z.infer<typeof ProjectInput>;

export const MODULES = [
  {
    id: 'national-research-brain',
    name: 'National Research Brain',
    purpose: 'Projects, disciplines, maturity, findings.',
  },
  {
    id: 'living-lab-tunisia',
    name: 'Living Lab Tunisia',
    purpose: 'Real-territory pilots with instrumented outcomes.',
  },
  {
    id: 'ai-innovation-transfer-engine',
    name: 'AI Innovation Transfer Engine',
    purpose: 'Matches a research result to the ministry that needs it.',
  },
] as const;

export const PUBLISHES = [
  'research.project.published.v1',
  'research.finding.released.v1',
  'research.transfer.matched.v1',
] as const;

export const CONSUMES = [
  'skills.gap.detected.v1',
  'agriculture.water-shortage.predicted.v1',
  'environment.climate-risk.updated.v1',
  'health.epidemic-signal.detected.v1',
  'industry.symbiosis.matched.v1',
  'infrastructure.failure.predicted.v1',
  'education.program.updated.v1',
  'treasury.funding.approved.v1',
  'twin.scenario.completed.v1',
  'land.site-suitability.scored.v1',
  'trade.supply-risk.flagged.v1',
  'global.diaspora-signal.updated.v1',
  'culture.asset-condition.updated.v1',
  'talent.injury-risk.flagged.v1',
] as const;
