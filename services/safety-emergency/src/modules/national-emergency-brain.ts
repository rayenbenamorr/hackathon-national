/**
 * National Emergency Brain — National Safety & Emergency Grid
 *
 * Triage, severity and the dispatch decision.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { z } from 'zod';
import { seededRandom } from '@platform/geo';
import {
  NotFoundError,
  nowIso,
  readSignals,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Incident } from '../domain.ts';
import { makeIncident, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'national-emergency-brain',
  name: 'National Emergency Brain',
  purpose: 'Triage, severity and the dispatch decision.',
} as const;

export const PostTriageInput = z.object({
  report: z.string(),
  governorate: z.string().optional(),
});

/** The shape the model must return. Mock mode satisfies it offline. */
export const PostTriageOutput = z.object({
  severity: z.enum(['minor', 'moderate', 'major', 'critical']),
  incidentType: z.string(),
  recommendedResources: z.array(z.string()),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
});

/** List every incident this ministry owns. */
export function listIncidents(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Incident>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One incident, with its digital twin. */
export function getIncident(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Incident>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Incident', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a incident. Any field you omit is filled with a plausible synthetic value. */
export async function createIncident(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Incident>(COLLECTION);
  const rng = seededRandom(`safety-emergency:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeIncident(rng, rows.count()), ...(req.body as Partial<Incident>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish(
    'emergency.incident.created.v1',
    {
      incidentId: created.id,
      incidentType: created.incidentType,
      severity: created.severity,
      location: created.location,
      governorate: created.governorate,
      casualties: created.casualties,
      declaredAt: created.declaredAt,
    },
    { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
  );

  return { data: created, synthetic: true };
}

/**
 * Classify an incoming report and say what to dispatch.
 *
 * Works with NO API KEY: `ctx.ai.structured` returns a value that satisfies
 * PostTriageOutput either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function postTriage(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof PostTriageInput>;
  const rows = ctx.db.collection<Incident>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => `- ${signal.from} sent ${signal.eventType}`)
    .join('\n');

  const prompt = [
    `You are the national-emergency-brain module of ${ctx.name}.`,
    'Classify an incoming report and say what to dispatch.',
    '',
    `Request: ${JSON.stringify(input)}`,
    '',
    `Own records (${rows.length} of incident):`,
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
