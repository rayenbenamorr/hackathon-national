/**
 * Athlete Digital Twin — National Talent Intelligence Network
 *
 * Load, performance and injury risk from wearable signals.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Facility } from '../domain.ts';

export const MODULE = {
  id: 'athlete-digital-twin',
  name: 'Athlete Digital Twin',
  purpose: 'Load, performance and injury risk from wearable signals.',
} as const;

export const PostTalentScoutInput = z.object({
  cohortId: z.string(),
  discipline: z.string().optional(),
});

/** Identical to the payload of `talent.injury-risk.flagged.v1` — the result IS the event. */
export const PostTalentScoutOutput = z.object({
  riskId: z.string(),
  cohortId: z.string(),
  discipline: z.string(),
  riskScore: z.number().min(0).max(1),
  drivers: z.array(z.string()),
  flaggedAt: z.string(),
});

/**
 * Assess a cohort load profile and flag injury risk.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostTalentScoutOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postTalentScout(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostTalentScoutInput>;
  const rows = ctx.db.collection<Facility>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the athlete-digital-twin module of ${ctx.name}.`,
    'Assess a cohort load profile and flag injury risk.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of sports facility):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostTalentScoutOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /talent/scout',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('talent.injury-risk.flagged.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
