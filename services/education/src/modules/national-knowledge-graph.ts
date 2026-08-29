/**
 * National Knowledge Graph — Adaptive Education OS
 *
 * Concepts, prerequisites and programme coverage.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { nowIso, readSignals, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type School } from '../domain.ts';

export const MODULE = {
  id: 'national-knowledge-graph',
  name: 'National Knowledge Graph',
  purpose: 'Concepts, prerequisites and programme coverage.',
} as const;

export const PostProgramsAdaptInput = z.object({
  need: z.string(),
  level: z.string().optional(),
  governorate: z.string().optional(),
});

/** Identical to the payload of `education.program.updated.v1` — the result IS the event. */
export const PostProgramsAdaptOutput = z.object({
  programId: z.string(),
  title: z.string(),
  level: z.string(),
  discipline: z.string(),
  governorate: z.string(),
  reason: z.string(),
  updatedAt: z.string(),
});

/**
 * Propose a programme adaptation against a national need.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostProgramsAdaptOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postProgramsAdapt(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostProgramsAdaptInput>;
  const rows = ctx.db.collection<School>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the national-knowledge-graph module of ${ctx.name}.`,
    'Propose a programme adaptation against a national need.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of school):`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\n');

  // `hints` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(PostProgramsAdaptOutput, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db
    .collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults')
    .insert({
      route: 'POST /programs/adapt',
      input,
      output: result,
      at: nowIso(),
    });

  await ctx.publish('education.program.updated.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}
