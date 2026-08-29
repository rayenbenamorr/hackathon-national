/**
 * Global Opportunity Engine — Global Tunisia Network
 *
 * Matches opportunities at home to capabilities abroad.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Consulate } from '../domain.ts';

export const MODULE = {
  id: 'global-opportunity-engine',
  name: 'Global Opportunity Engine',
  purpose: 'Matches opportunities at home to capabilities abroad.',
} as const;

export const PostOpportunitiesMatchInput = z.object({
  need: z.string(),
  sector: z.string().optional(),
  governorate: z.string().optional(),
});

/** Identical to the payload of `global.opportunity.published.v1` — the result IS the event. */
export const PostOpportunitiesMatchOutput = z.object({
  opportunityId: z.string(),
  title: z.string(),
  sector: z.string(),
  governorate: z.string(),
  requiredSkills: z.array(z.string()),
  publishedAt: z.string(),
});

/**
 * Match a national need to diaspora capability.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostOpportunitiesMatchOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postOpportunitiesMatch(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostOpportunitiesMatchInput>;
  const rows = ctx.db.collection<Consulate>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the global-opportunity-engine module of ${ctx.name}.`,
    'Match a national need to diaspora capability.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of consular post):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostOpportunitiesMatchOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /opportunities/match',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('global.opportunity.published.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
