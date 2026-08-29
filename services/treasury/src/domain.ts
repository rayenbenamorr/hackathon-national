/**
 * DOMAIN MODEL — Intelligent Treasury OS
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';

export const COLLECTION = 'budgetLines';
export const ENTITY_LABEL = 'Budget line';

export const BudgetLine = z.object({
  id: z.string(),
  label: z.string(),
  programme: z.string(),
  ministry: z.string(),
  fiscalYear: z.number().int(),
  allocatedTnd: z.number(),
  committedTnd: z.number(),
  governorate: z.string(),
  instrument: z.enum(['budget-line', 'grant', 'subsidy', 'loan', 'guarantee', 'aid-wallet']),
  priority: z.enum(['low', 'standard', 'high', 'emergency']),
  synthetic: z.boolean().default(true),
});
export type BudgetLine = z.infer<typeof BudgetLine>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const BudgetLineInput = BudgetLine.omit({ id: true, synthetic: true }).partial();
export type BudgetLineInput = z.infer<typeof BudgetLineInput>;

export const MODULES = [
  {
    id: 'real-time-treasury-twin',
    name: 'Real-Time Treasury Twin',
    purpose: 'Live position of every budget line.',
  },
  {
    id: 'ai-public-budget-optimizer',
    name: 'AI Public Budget Optimizer',
    purpose: 'Reallocation proposals under an explicit constraint.',
  },
  {
    id: 'smart-aid-wallet',
    name: 'Smart Aid Wallet',
    purpose: 'Targeted, traceable aid disbursement.',
  },
] as const;

export const PUBLISHES = [
  'treasury.budget-line.updated.v1',
  'treasury.funding.approved.v1',
  'treasury.aid.disbursed.v1',
  'treasury.fiscal-risk.flagged.v1',
] as const;

export const CONSUMES = [
  'resilience.relief-plan.updated.v1',
  'resilience.resource-request.created.v1',
  'health.capacity.updated.v1',
  'agriculture.water-shortage.predicted.v1',
  'infrastructure.failure.predicted.v1',
  'infrastructure.maintenance.scheduled.v1',
  'social.household-need.detected.v1',
  'energy.outage-risk.flagged.v1',
  'trade.supply-risk.flagged.v1',
  'education.program.updated.v1',
  'justice.court-load.updated.v1',
  'twin.scenario.completed.v1',
  'emergency.incident.resolved.v1',
  'land.site-suitability.scored.v1',
  'research.transfer.matched.v1',
] as const;
