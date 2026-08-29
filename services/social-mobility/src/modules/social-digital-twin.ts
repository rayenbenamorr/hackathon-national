/**
 * Social Digital Twin — Social Mobility OS
 *
 * Vulnerability per household cohort, continuously updated.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { NotFoundError, type Paging, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Cohort } from '../domain.ts';
import { twinIdFor } from '../seed.ts';

export const MODULE = {
  id: 'social-digital-twin',
  name: 'Social Digital Twin',
  purpose: 'Vulnerability per household cohort, continuously updated.',
} as const;

/** List every household cohort this ministry owns. */
export function listCohorts(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Cohort>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One household cohort, with its digital twin. */
export function getCohort(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Cohort>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Household cohort', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}
