/**
 * Personal Health Digital Twin — Connected Health Intelligence System
 *
 * Pseudonymous cohort twins — never an identified person.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Facility } from '../domain.ts';

export const MODULE = {
  id: 'personal-health-digital-twin',
  name: 'Personal Health Digital Twin',
  purpose: 'Pseudonymous cohort twins — never an identified person.',
} as const;

export const PostEpidemicScanInput = z.object({
  governorate: z.string(),
});

/** Identical to the payload of `health.epidemic-signal.detected.v1` — the result IS the event. */
export const PostEpidemicScanOutput = z.object({
  signalId: z.string(),
  governorate: z.string(),
  syndrome: z.string(),
  excessCases: z.number().int(),
  confidence: z.number().min(0).max(1),
  suspectedDrivers: z.array(z.string()),
  detectedAt: z.string(),
});

/**
 * Scan cohort and environmental signals for an emerging epidemic pattern.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostEpidemicScanOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postEpidemicScan(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostEpidemicScanInput>;
  const rows = ctx.db.collection<Facility>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the personal-health-digital-twin module of ${ctx.name}.`,
    'Scan cohort and environmental signals for an emerging epidemic pattern.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of health facility):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostEpidemicScanOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /epidemic/scan',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('health.epidemic-signal.detected.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
