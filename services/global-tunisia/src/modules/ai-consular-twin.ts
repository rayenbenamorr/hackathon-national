/**
 * AI Consular Twin — Global Tunisia Network
 *
 * Consular demand and processing time per post.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { seededRandom } from '@platform/geo';
import { NotFoundError, type Paging, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Consulate } from '../domain.ts';
import { makeConsulate, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'ai-consular-twin',
  name: 'AI Consular Twin',
  purpose: 'Consular demand and processing time per post.',
} as const;

/** List every consular post this ministry owns. */
export function listConsulates(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Consulate>(COLLECTION);
  const items = rows.list({
    // This ministry does not key its records by governorate, so ?governorate= is ignored here.
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One consular post, with its digital twin. */
export function getConsulate(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Consulate>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Consular post', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a consular post. Any field you omit is filled with a plausible synthetic value. */
export async function createConsulate(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Consulate>(COLLECTION);
  const rng = seededRandom(`global-tunisia:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeConsulate(rng, rows.count()), ...(req.body as Partial<Consulate>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}
