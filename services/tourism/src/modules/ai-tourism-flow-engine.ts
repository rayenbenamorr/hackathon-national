/**
 * AI Tourism Flow Engine — Tunisia Immersive Tourism OS
 *
 * Itineraries that redistribute pressure.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Site } from '../domain.ts';

export const MODULE = {
  id: 'ai-tourism-flow-engine',
  name: 'AI Tourism Flow Engine',
  purpose: 'Itineraries that redistribute pressure.',
} as const;

export const PostItineraryInput = z.object({
  interests: z.array(z.string()),
  governorate: z.string().optional(),
  days: z.number().int().optional(),
});

/** Identical to the payload of `tourism.experience.published.v1` — the result IS the event. */
export const PostItineraryOutput = z.object({
  experienceId: z.string(),
  title: z.string(),
  governorate: z.string(),
  sites: z.array(z.string()),
  durationHours: z.number().int(),
  publishedAt: z.string(),
});

/**
 * Build an itinerary that avoids saturated sites and bad air days.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostItineraryOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postItinerary(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostItineraryInput>;
  const rows = ctx.db.collection<Site>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the ai-tourism-flow-engine module of ${ctx.name}.`,
    'Build an itinerary that avoids saturated sites and bad air days.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of tourism site):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostItineraryOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /itinerary',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('tourism.experience.published.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
