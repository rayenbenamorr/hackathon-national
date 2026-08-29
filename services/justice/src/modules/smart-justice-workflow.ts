/**
 * Smart Justice Workflow — Justice Intelligence OS
 *
 * Case stages, deadlines and the events other ministries need.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { seededRandom } from '@platform/geo';
import {
  NotFoundError,
  nowIso,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Cas } from '../domain.ts';
import { makeCas, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'smart-justice-workflow',
  name: 'Smart Justice Workflow',
  purpose: 'Case stages, deadlines and the events other ministries need.',
} as const;

/** List every case this ministry owns. */
export function listCases(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Cas>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One case, with its digital twin. */
export function getCas(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Cas>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Case', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a case. Any field you omit is filled with a plausible synthetic value. */
export async function createCas(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Cas>(COLLECTION);
  const rng = seededRandom(`justice:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeCas(rng, rows.count()), ...(req.body as Partial<Cas>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish(
    'justice.case.filed.v1',
    {
      caseId: created.id,
      matter: created.matter,
      court: created.court,
      governorate: created.governorate,
      filedAt: nowIso(),
    },
    { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
  );

  return { data: created, synthetic: true };
}
