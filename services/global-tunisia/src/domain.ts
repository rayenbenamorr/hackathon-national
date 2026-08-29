/**
 * DOMAIN MODEL — Global Tunisia Network
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';

export const COLLECTION = 'consulates';
export const ENTITY_LABEL = 'Consular post';

export const Consulate = z.object({
  id: z.string(),
  label: z.string(),
  country: z.string(),
  city: z.string(),
  cohortSize: z.number().int(),
  pendingRequests: z.number().int(),
  averageProcessingDays: z.number().int(),
  topSkills: z.array(z.string()),
  load: z.number().min(0).max(1),
  synthetic: z.boolean().default(true),
});
export type Consulate = z.infer<typeof Consulate>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const ConsulateInput = Consulate.omit({ id: true, synthetic: true }).partial();
export type ConsulateInput = z.infer<typeof ConsulateInput>;

export const MODULES = [
  {
    id: 'diaspora-intelligence-graph',
    name: 'Diaspora Intelligence Graph',
    purpose: 'Aggregate, privacy-safe picture of skills and presence abroad.',
  },
  {
    id: 'ai-consular-twin',
    name: 'AI Consular Twin',
    purpose: 'Consular demand and processing time per post.',
  },
  {
    id: 'global-opportunity-engine',
    name: 'Global Opportunity Engine',
    purpose: 'Matches opportunities at home to capabilities abroad.',
  },
] as const;

export const PUBLISHES = [
  'global.consular-request.created.v1',
  'global.opportunity.published.v1',
  'global.diaspora-signal.updated.v1',
] as const;

export const CONSUMES = [
  'skills.gap.detected.v1',
  'skills.micro-mission.published.v1',
  'research.project.published.v1',
  'trade.export-opportunity.detected.v1',
  'treasury.funding.approved.v1',
  'culture.event.scheduled.v1',
  'tourism.experience.published.v1',
  'justice.legal-text.published.v1',
  'health.epidemic-signal.detected.v1',
  'resilience.crisis.declared.v1',
  'education.program.updated.v1',
  'twin.state.updated.v1',
  'land.site-suitability.scored.v1',
  'care.life-event.recorded.v1',
  'social.benefit.granted.v1',
  'industry.production.updated.v1',
] as const;
