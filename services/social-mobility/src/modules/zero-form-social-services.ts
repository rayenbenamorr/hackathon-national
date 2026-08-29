/**
 * Zero-Form Social Services — Social Mobility OS
 *
 * Eligibility computed from existing signals.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Cohort } from '../domain.ts';

export const MODULE = {
  id: 'zero-form-social-services',
  name: 'Zero-Form Social Services',
  purpose: 'Eligibility computed from existing signals.',
} as const;

export const PostEligibilityInput = z.object({
  cohortId: z.string(),
  benefitType: z.string(),
});

/** Identical to the payload of `social.household-need.detected.v1` — the result IS the event. */
export const PostEligibilityOutput = z.object({
  needId: z.string(),
  cohortId: z.string(),
  needType: z.enum(['water', 'energy', 'food', 'health', 'housing', 'schooling', 'income']),
  governorate: z.string(),
  urgency: z.enum(['normal', 'high', 'critical']),
  detectedAt: z.string(),
});

/**
 * Decide eligibility from signals already held, and explain the decision.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostEligibilityOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postEligibility(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostEligibilityInput>;
  const rows = ctx.db.collection<Cohort>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the zero-form-social-services module of ${ctx.name}.`,
    'Decide eligibility from signals already held, and explain the decision.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of household cohort):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostEligibilityOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /eligibility',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('social.household-need.detected.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
