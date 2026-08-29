/**
 * AI Export Copilot — Smart Trade Network
 *
 * What a producer must do to reach a target market.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Product } from '../domain.ts';

export const MODULE = {
  id: 'ai-export-copilot',
  name: 'AI Export Copilot',
  purpose: 'What a producer must do to reach a target market.',
} as const;

export const PostExportAdviceInput = z.object({
  productId: z.string(),
  market: z.string(),
});

/** Identical to the payload of `trade.export-opportunity.detected.v1` — the result IS the event. */
export const PostExportAdviceOutput = z.object({
  opportunityId: z.string(),
  productId: z.string(),
  market: z.string(),
  estimatedValueTnd: z.number(),
  requirements: z.array(z.string()),
  detectedAt: z.string(),
});

/**
 * What this product needs to enter a given market.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostExportAdviceOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postExportAdvice(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostExportAdviceInput>;
  const rows = ctx.db.collection<Product>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the ai-export-copilot module of ${ctx.name}.`,
    'What this product needs to enter a given market.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of product):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostExportAdviceOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /export/advice',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('trade.export-opportunity.detected.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
