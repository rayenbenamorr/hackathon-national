/**
 * AI Legal Navigator — Justice Intelligence OS
 *
 * RAG over published legal texts so a citizen question gets a sourced answer.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Cas } from '../domain.ts';

export const MODULE = {
  id: 'ai-legal-navigator',
  name: 'AI Legal Navigator',
  purpose: 'RAG over published legal texts so a citizen question gets a sourced answer.',
} as const;

export const PostNavigatorAskInput = z.object({
  question: z.string(),
  domain: z.string().optional(),
});

/** The shape the model must return. Mock mode satisfies it offline. */
export const PostNavigatorAskOutput = z.object({
  answer: z.string(),
  citedTexts: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  caution: z.string(),
});

/**
 * Ask a legal question; answered only from the published texts held by this service.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostNavigatorAskOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postNavigatorAsk(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostNavigatorAskInput>;
  const rows = ctx.db.collection<Cas>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the ai-legal-navigator module of ${ctx.name}.`,
    'Ask a legal question; answered only from the published texts held by this service.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of case):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostNavigatorAskOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /navigator/ask',
      input,
      output: result,
      at: nowIso(),
    });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
