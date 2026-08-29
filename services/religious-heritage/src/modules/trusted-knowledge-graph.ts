/**
 * Trusted Knowledge Graph — Smart Religious Heritage Network
 *
 * Sourced, verifiable knowledge — never generated assertion.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Site } from '../domain.ts';

export const MODULE = {
  id: 'trusted-knowledge-graph',
  name: 'Trusted Knowledge Graph',
  purpose: 'Sourced, verifiable knowledge — never generated assertion.',
} as const;

export const PostKnowledgeAskInput = z.object({
  question: z.string(),
});

/** The shape the model must return. Mock mode satisfies it offline. */
export const PostKnowledgeAskOutput = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
  sourceCount: z.number().int(),
  confidence: z.number().min(0).max(1),
});

/**
 * Answer only from registered sources, and say when there are none.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostKnowledgeAskOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postKnowledgeAsk(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostKnowledgeAskInput>;
  const rows = ctx.db.collection<Site>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the trusted-knowledge-graph module of ${ctx.name}.`,
    'Answer only from registered sources, and say when there are none.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of heritage site):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostKnowledgeAskOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /knowledge/ask',
      input,
      output: result,
      at: nowIso(),
    });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
