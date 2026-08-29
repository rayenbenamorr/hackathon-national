/**
 * AI Career Digital Twin — National Skills & Opportunity OS
 *
 * A path from where a person is to where demand is.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Skill } from '../domain.ts';

export const MODULE = {
  id: 'ai-career-digital-twin',
  name: 'AI Career Digital Twin',
  purpose: 'A path from where a person is to where demand is.',
} as const;

export const PostCareerPlanInput = z.object({
  currentSkills: z.array(z.string()),
  governorate: z.string(),
  targetDomain: z.string().optional(),
});

/** Identical to the payload of `skills.gap.detected.v1` — the result IS the event. */
export const PostCareerPlanOutput = z.object({
  gapId: z.string(),
  skill: z.string(),
  domain: z.string(),
  governorate: z.string(),
  gap: z.number(),
  drivenBy: z.array(z.string()),
  detectedAt: z.string(),
});

/**
 * Build a training path from a current profile to real regional demand.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostCareerPlanOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postCareerPlan(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostCareerPlanInput>;
  const rows = ctx.db.collection<Skill>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the ai-career-digital-twin module of ${ctx.name}.`,
    'Build a training path from a current profile to real regional demand.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of skill):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostCareerPlanOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /career/plan',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('skills.gap.detected.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
