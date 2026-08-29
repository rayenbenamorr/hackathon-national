/**
 * AI Public Budget Optimizer — Intelligent Treasury OS
 *
 * Reallocation proposals under an explicit constraint.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type BudgetLine } from '../domain.ts';

export const MODULE = {
  id: 'ai-public-budget-optimizer',
  name: 'AI Public Budget Optimizer',
  purpose: 'Reallocation proposals under an explicit constraint.',
} as const;

export const PostBudgetOptimiseInput = z.object({
  objective: z.string(),
  governorate: z.string().optional(),
  maxShiftTnd: z.number().optional(),
});

/** Identical to the payload of `treasury.fiscal-risk.flagged.v1` — the result IS the event. */
export const PostBudgetOptimiseOutput = z.object({
  riskId: z.string(),
  driver: z.string(),
  exposureTnd: z.number(),
  governorate: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  flaggedAt: z.string(),
});

/**
 * Propose a reallocation under a stated constraint, with its rationale.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostBudgetOptimiseOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postBudgetOptimise(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostBudgetOptimiseInput>;
  const rows = ctx.db.collection<BudgetLine>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the ai-public-budget-optimizer module of ${ctx.name}.`,
    'Propose a reallocation under a stated constraint, with its rationale.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of budget line):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostBudgetOptimiseOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /budget/optimise',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('treasury.fiscal-risk.flagged.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
