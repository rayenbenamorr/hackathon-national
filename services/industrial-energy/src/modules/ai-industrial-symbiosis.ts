/**
 * AI Industrial Symbiosis — Industrial & Energy Intelligence Grid
 *
 * Matches one plant output stream to another plant input.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Asset } from '../domain.ts';

export const MODULE = {
  id: 'ai-industrial-symbiosis',
  name: 'AI Industrial Symbiosis',
  purpose: 'Matches one plant output stream to another plant input.',
} as const;

export const PostSymbiosisMatchInput = z.object({
  assetId: z.string(),
  stream: z.string().optional(),
});

/** Identical to the payload of `industry.symbiosis.matched.v1` — the result IS the event. */
export const PostSymbiosisMatchOutput = z.object({
  matchId: z.string(),
  sourceAssetId: z.string(),
  targetAssetId: z.string(),
  stream: z.string(),
  tonnesPerYear: z.number(),
  governorate: z.string(),
  matchedAt: z.string(),
});

/**
 * Find a use for a waste stream in another plant.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostSymbiosisMatchOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postSymbiosisMatch(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostSymbiosisMatchInput>;
  const rows = ctx.db.collection<Asset>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the ai-industrial-symbiosis module of ${ctx.name}.`,
    'Find a use for a waste stream in another plant.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of industrial asset):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostSymbiosisMatchOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /symbiosis/match',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('industry.symbiosis.matched.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
