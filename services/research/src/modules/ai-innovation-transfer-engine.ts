/**
 * AI Innovation Transfer Engine — Tunisia Research Brain
 *
 * Matches a research result to the ministry that needs it.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Project } from '../domain.ts';

export const MODULE = {
  id: 'ai-innovation-transfer-engine',
  name: 'AI Innovation Transfer Engine',
  purpose: 'Matches a research result to the ministry that needs it.',
} as const;

export const PostTransferMatchInput = z.object({
  need: z.string(),
  targetService: z.string().optional(),
});

/** Identical to the payload of `research.transfer.matched.v1` — the result IS the event. */
export const PostTransferMatchOutput = z.object({
  transferId: z.string(),
  findingId: z.string(),
  targetService: z.string(),
  need: z.string(),
  readiness: z.number().min(0).max(1),
  matchedAt: z.string(),
});

/**
 * Find the research result that answers a stated ministry need.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostTransferMatchOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postTransferMatch(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostTransferMatchInput>;
  const rows = ctx.db.collection<Project>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the ai-innovation-transfer-engine module of ${ctx.name}.`,
    'Find the research result that answers a stated ministry need.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of research project):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostTransferMatchOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /transfer/match',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('research.transfer.matched.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
