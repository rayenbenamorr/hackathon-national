/**
 * Tunisia Digital Twin — Tunisia National Digital Twin
 *
 * Regional state assembled from every ministry signal.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { NotFoundError, type Paging, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type RegionState } from '../domain.ts';
import { twinIdFor } from '../seed.ts';

export const MODULE = {
  id: 'tunisia-digital-twin',
  name: 'Tunisia Digital Twin',
  purpose: 'Regional state assembled from every ministry signal.',
} as const;

/** List every region state this ministry owns. */
export function listRegionStates(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<RegionState>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One region state, with its digital twin. */
export function getRegionState(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<RegionState>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Region state', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}
