/**
 * National Scenario Engine — Tunisia National Digital Twin
 *
 * What-if simulation across sectors.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type RegionState } from '../domain.ts';

export const MODULE = {
  id: 'national-scenario-engine',
  name: 'National Scenario Engine',
  purpose: 'What-if simulation across sectors.',
} as const;

export const PostScenariosRunInput = z.object({
  question: z.string(),
  governorate: z.string().optional(),
  horizonMonths: z.number().int().optional(),
});

/** Identical to the payload of `twin.scenario.completed.v1` — the result IS the event. */
export const PostScenariosRunOutput = z.object({
  scenarioId: z.string(),
  question: z.string(),
  governorate: z.string(),
  outcome: z.string(),
  impactedSectors: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  completedAt: z.string(),
});

/**
 * Run a cross-sector what-if and broadcast the outcome.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostScenariosRunOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postScenariosRun(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostScenariosRunInput>;
  const rows = ctx.db.collection<RegionState>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the national-scenario-engine module of ${ctx.name}.`,
    'Run a cross-sector what-if and broadcast the outcome.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of region state):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostScenariosRunOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /scenarios/run',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('twin.scenario.completed.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
