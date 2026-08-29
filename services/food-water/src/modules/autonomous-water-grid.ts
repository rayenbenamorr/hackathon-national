/**
 * Autonomous Water Grid — Autonomous Food & Water Grid
 *
 * Reservoirs, networks and demand as one balance.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import {
  avg,
  groupRows,
  nowIso,
  readSignals,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Farm } from '../domain.ts';

export const MODULE = {
  id: 'autonomous-water-grid',
  name: 'Autonomous Water Grid',
  purpose: 'Reservoirs, networks and demand as one balance.',
} as const;

export const PostWaterDemandForecastInput = z.object({
  governorate: z.string(),
  horizonDays: z.number().int().optional(),
});

/** Identical to the payload of `agriculture.water-demand.predicted.v1` — the result IS the event. */
export const PostWaterDemandForecastOutput = z.object({
  forecastId: z.string(),
  governorate: z.string(),
  horizonDays: z.number().int(),
  demandM3Day: z.number(),
  confidence: z.number().min(0).max(1),
  drivers: z.array(z.string()),
  predictedAt: z.string(),
});

export const PostWaterShortagePredictInput = z.object({
  governorate: z.string(),
  horizonDays: z.number().int().optional(),
});

/** Identical to the payload of `agriculture.water-shortage.predicted.v1` — the result IS the event. */
export const PostWaterShortagePredictOutput = z.object({
  alertId: z.string(),
  governorate: z.string(),
  horizonDays: z.number().int(),
  deficitM3Day: z.number(),
  severity: z.enum(['watch', 'alert', 'critical']),
  affectedFarms: z.number().int(),
  predictedAt: z.string(),
});

/**
 * Forecast water demand for a governorate from soil, weather and crop state.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostWaterDemandForecastOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postWaterDemandForecast(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostWaterDemandForecastInput>;
  const rows = ctx.db.collection<Farm>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the autonomous-water-grid module of ${ctx.name}.`,
    'Forecast water demand for a governorate from soil, weather and crop state.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of farm):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostWaterDemandForecastOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /water/demand/forecast',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('agriculture.water-demand.predicted.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}

/**
 * Predict a shortage and alert every ministry that depends on water.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostWaterShortagePredictOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postWaterShortagePredict(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostWaterShortagePredictInput>;
  const rows = ctx.db.collection<Farm>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the autonomous-water-grid module of ${ctx.name}.`,
    'Predict a shortage and alert every ministry that depends on water.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of farm):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostWaterShortagePredictOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /water/shortage/predict',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('agriculture.water-shortage.predicted.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}

/** Water demand by governorate. */
export async function getIrrigationPlan(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Farm>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    areaHectares: avg(groupRows_, 'areaHectares'),
    soilMoisturePct: avg(groupRows_, 'soilMoisturePct'),
    waterDemandM3Day: avg(groupRows_, 'waterDemandM3Day'),
    yieldForecastTonnes: avg(groupRows_, 'yieldForecastTonnes'),
    stressIndex: avg(groupRows_, 'stressIndex'),
  }));
  items.sort((a, b) => b.count - a.count);

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
