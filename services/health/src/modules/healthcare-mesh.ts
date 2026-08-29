/**
 * Healthcare Mesh — Connected Health Intelligence System
 *
 * Coordination with transport, social services and emergency.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Facility } from '../domain.ts';

export const MODULE = {
  id: 'healthcare-mesh',
  name: 'Healthcare Mesh',
  purpose: 'Coordination with transport, social services and emergency.',
} as const;

export const PostTriageInput = z.object({
  description: z.string(),
  governorate: z.string().optional(),
});

/** The shape the model must return. Mock mode satisfies it offline. */
export const PostTriageOutput = z.object({
  urgency: z.enum(['routine', 'urgent', 'emergency', 'critical']),
  suspectedCategory: z.string(),
  recommendedFacility: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
});

/**
 * Assess a case description and name the facility type it needs.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostTriageOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postTriage(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostTriageInput>;
  const rows = ctx.db.collection<Facility>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the healthcare-mesh module of ${ctx.name}.`,
    'Assess a case description and name the facility type it needs.',
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
  const result = await ctx.ai.structured(PostTriageOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /triage',
      input,
      output: result,
      at: nowIso(),
    });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
