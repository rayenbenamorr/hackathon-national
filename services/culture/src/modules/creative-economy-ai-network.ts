/**
 * Creative Economy AI Network — Tunisia Cultural Intelligence Network
 *
 * Creative activity, audience and revenue.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Asset } from '../domain.ts';

export const MODULE = {
  id: 'creative-economy-ai-network',
  name: 'Creative Economy AI Network',
  purpose: 'Creative activity, audience and revenue.',
} as const;

export const PostEventsPlanInput = z.object({
  title: z.string(),
  governorate: z.string(),
  expectedAttendance: z.number().int().optional(),
});

/** Identical to the payload of `culture.event.scheduled.v1` — the result IS the event. */
export const PostEventsPlanOutput = z.object({
  eventId: z.string(),
  title: z.string(),
  governorate: z.string(),
  location: GeoLocation,
  expectedAttendance: z.number().int(),
  startsAt: z.string(),
});

/**
 * Plan a cultural event and warn the ministries whose load it will change.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostEventsPlanOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postEventsPlan(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostEventsPlanInput>;
  const rows = ctx.db.collection<Asset>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the creative-economy-ai-network module of ${ctx.name}.`,
    'Plan a cultural event and warn the ministries whose load it will change.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of cultural asset):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostEventsPlanOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /events/plan',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('culture.event.scheduled.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
