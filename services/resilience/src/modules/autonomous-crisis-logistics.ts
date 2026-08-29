/**
 * Autonomous Crisis Logistics — National Resilience Command System
 *
 * Turns needs into a resourced, sequenced relief plan.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Cris } from '../domain.ts';

export const MODULE = {
  id: 'autonomous-crisis-logistics',
  name: 'Autonomous Crisis Logistics',
  purpose: 'Turns needs into a resourced, sequenced relief plan.',
} as const;

export const PostLogisticsPlanInput = z.object({
  crisisId: z.string(),
  horizonHours: z.number().int().optional(),
});

/** Identical to the payload of `resilience.relief-plan.updated.v1` — the result IS the event. */
export const PostLogisticsPlanOutput = z.object({
  crisisId: z.string(),
  governorate: z.string(),
  requiredResources: z.array(z.string()),
  coveragePct: z.number().min(0).max(1),
  updatedAt: z.string(),
});

/**
 * Produce a relief plan for a crisis and broadcast it.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostLogisticsPlanOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postLogisticsPlan(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostLogisticsPlanInput>;
  const rows = ctx.db.collection<Cris>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the autonomous-crisis-logistics module of ${ctx.name}.`,
    'Produce a relief plan for a crisis and broadcast it.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of crisis):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostLogisticsPlanOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /logistics/plan',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('resilience.relief-plan.updated.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
