/**
 * Life Journey AI — Life & Care Intelligence OS
 *
 * Life events and the support each one should trigger.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Facility } from '../domain.ts';

export const MODULE = {
  id: 'life-journey-ai',
  name: 'Life Journey AI',
  purpose: 'Life events and the support each one should trigger.',
} as const;

export const PostLifeEventInput = z.object({
  cohortId: z.string(),
  eventType: z.string(),
  governorate: z.string(),
});

/** Identical to the payload of `care.support-need.detected.v1` — the result IS the event. */
export const PostLifeEventOutput = z.object({
  needId: z.string(),
  cohortId: z.string(),
  needType: z.string(),
  governorate: z.string(),
  urgency: z.enum(['normal', 'high', 'critical']),
  detectedAt: z.string(),
});

/**
 * Record a life event and infer the support it should trigger.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostLifeEventOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postLifeEvent(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostLifeEventInput>;
  const rows = ctx.db.collection<Facility>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the life-journey-ai module of ${ctx.name}.`,
    'Record a life event and infer the support it should trigger.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of care facility):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostLifeEventOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /life-event',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('care.support-need.detected.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
