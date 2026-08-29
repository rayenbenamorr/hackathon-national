/**
 * Predictive Infrastructure Maintenance — Smart Infrastructure OS
 *
 * Failure prediction and work orders.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Asset } from '../domain.ts';

export const MODULE = {
  id: 'predictive-infrastructure-maintenance',
  name: 'Predictive Infrastructure Maintenance',
  purpose: 'Failure prediction and work orders.',
} as const;

export const PostMaintenancePredictInput = z.object({
  assetId: z.string(),
  horizonDays: z.number().int().optional(),
});

/** Identical to the payload of `infrastructure.failure.predicted.v1` — the result IS the event. */
export const PostMaintenancePredictOutput = z.object({
  predictionId: z.string(),
  assetId: z.string(),
  assetType: z.string(),
  governorate: z.string(),
  horizonDays: z.number().int(),
  probability: z.number().min(0).max(1),
  consequence: z.string(),
  predictedAt: z.string(),
});

/**
 * Predict failure for an asset and warn everyone downstream of it.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostMaintenancePredictOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postMaintenancePredict(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostMaintenancePredictInput>;
  const rows = ctx.db.collection<Asset>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the predictive-infrastructure-maintenance module of ${ctx.name}.`,
    'Predict failure for an asset and warn everyone downstream of it.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of infrastructure asset):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostMaintenancePredictOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /maintenance/predict',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('infrastructure.failure.predicted.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
