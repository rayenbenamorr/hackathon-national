/**
 * AI Farm Digital Twin — Autonomous Food & Water Grid
 *
 * Soil, crop and irrigation state per farm.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { seededRandom } from '@platform/geo';
import { NotFoundError, type Paging, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Farm } from '../domain.ts';
import { makeFarm, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'ai-farm-digital-twin',
  name: 'AI Farm Digital Twin',
  purpose: 'Soil, crop and irrigation state per farm.',
} as const;

/** List every farm this ministry owns. */
export function listFarms(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Farm>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One farm, with its digital twin. */
export function getFarm(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Farm>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Farm', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a farm. Any field you omit is filled with a plausible synthetic value. */
export async function createFarm(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Farm>(COLLECTION);
  const rng = seededRandom(`food-water:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeFarm(rng, rows.count()), ...(req.body as Partial<Farm>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}
