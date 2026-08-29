/**
 * National Resilience Digital Twin — National Resilience Command System
 *
 * Live state of every declared crisis and the zones it covers.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { seededRandom } from '@platform/geo';
import { NotFoundError, type Paging, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Cris } from '../domain.ts';
import { makeCris, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'national-resilience-digital-twin',
  name: 'National Resilience Digital Twin',
  purpose: 'Live state of every declared crisis and the zones it covers.',
} as const;

/** List every crisis this ministry owns. */
export function listCrises(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Cris>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One crisis, with its digital twin. */
export function getCris(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Cris>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Crisis', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a crisis. Any field you omit is filled with a plausible synthetic value. */
export async function createCris(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Cris>(COLLECTION);
  const rng = seededRandom(`resilience:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeCris(rng, rows.count()), ...(req.body as Partial<Cris>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish(
    'resilience.crisis.declared.v1',
    {
      crisisId: created.id,
      kind: created.kind,
      severity: created.severity,
      governorate: created.governorate,
      location: created.location,
      affectedPeople: created.affectedPeople,
      declaredAt: created.declaredAt,
    },
    { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
  );

  return { data: created, synthetic: true };
}
