/**
 * Climate Digital Twin — Environmental Nervous System
 *
 * Projections and climate risk per zone.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Station } from '../domain.ts';

export const MODULE = {
  id: 'climate-digital-twin',
  name: 'Climate Digital Twin',
  purpose: 'Projections and climate risk per zone.',
} as const;

export const PostClimateProjectionInput = z.object({
  governorate: z.string(),
  horizonMonths: z.number().int().optional(),
});

/** Identical to the payload of `environment.climate-risk.updated.v1` — the result IS the event. */
export const PostClimateProjectionOutput = z.object({
  governorate: z.string(),
  droughtIndex: z.number().min(0).max(1),
  heatRisk: z.number().min(0).max(1),
  floodRisk: z.number().min(0).max(1),
  horizonMonths: z.number().int(),
  updatedAt: z.string(),
});

/**
 * Project climate risk for a governorate and warn the ministries it constrains.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostClimateProjectionOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postClimateProjection(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostClimateProjectionInput>;
  const rows = ctx.db.collection<Station>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the climate-digital-twin module of ${ctx.name}.`,
    'Project climate risk for a governorate and warn the ministries it constrains.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of environmental station):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostClimateProjectionOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /climate/projection',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('environment.climate-risk.updated.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
