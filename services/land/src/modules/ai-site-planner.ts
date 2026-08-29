/**
 * AI Site Planner — National Land Intelligence System
 *
 * Multi-criteria site suitability scoring.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Parcel } from '../domain.ts';

export const MODULE = {
  id: 'ai-site-planner',
  name: 'AI Site Planner',
  purpose: 'Multi-criteria site suitability scoring.',
} as const;

export const PostSitingEvaluateInput = z.object({
  parcelId: z.string(),
  proposedUse: z.string(),
});

/** Identical to the payload of `land.site-suitability.scored.v1` — the result IS the event. */
export const PostSitingEvaluateOutput = z.object({
  evaluationId: z.string(),
  parcelId: z.string(),
  proposedUse: z.string(),
  governorate: z.string(),
  score: z.number().min(0).max(1),
  constraints: z.array(z.string()),
  scoredAt: z.string(),
});

/**
 * Score a parcel for a proposed use against water, risk, mobility and environment constraints.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostSitingEvaluateOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postSitingEvaluate(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostSitingEvaluateInput>;
  const rows = ctx.db.collection<Parcel>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the ai-site-planner module of ${ctx.name}.`,
    'Score a parcel for a proposed use against water, risk, mobility and environment constraints.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of land parcel):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostSitingEvaluateOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /siting/evaluate',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('land.site-suitability.scored.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
