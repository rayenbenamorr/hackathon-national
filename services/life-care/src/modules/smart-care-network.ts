/**
 * Smart Care Network — Life & Care Intelligence OS
 *
 * Care facilities, capacity and coverage.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { seededRandom } from '@platform/geo';
import { NotFoundError, type Paging, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Facility } from '../domain.ts';
import { makeFacility, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'smart-care-network',
  name: 'Smart Care Network',
  purpose: 'Care facilities, capacity and coverage.',
} as const;

/** List every care facility this ministry owns. */
export function listFacilities(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Facility>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One care facility, with its digital twin. */
export function getFacility(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Facility>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Care facility', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a care facility. Any field you omit is filled with a plausible synthetic value. */
export async function createFacility(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Facility>(COLLECTION);
  const rng = seededRandom(`life-care:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeFacility(rng, rows.count()), ...(req.body as Partial<Facility>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}
