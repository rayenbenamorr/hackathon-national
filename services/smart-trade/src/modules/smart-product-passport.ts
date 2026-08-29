/**
 * Smart Product Passport — Smart Trade Network
 *
 * Origin, footprint and certification as a portable record.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { newId } from '@platform/observability';
import { seededRandom } from '@platform/geo';
import {
  NotFoundError,
  nowIso,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Product } from '../domain.ts';
import { makeProduct, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'smart-product-passport',
  name: 'Smart Product Passport',
  purpose: 'Origin, footprint and certification as a portable record.',
} as const;

/** List every product this ministry owns. */
export function listProducts(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Product>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.originGovernorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One product, with its digital twin. */
export function getProduct(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Product>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Product', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a product. Any field you omit is filled with a plausible synthetic value. */
export async function createProduct(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Product>(COLLECTION);
  const rng = seededRandom(`smart-trade:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeProduct(rng, rows.count()), ...(req.body as Partial<Product>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish(
    'trade.product-passport.issued.v1',
    {
      passportId: newId('passport'),
      productId: created.id,
      category: created.category,
      originGovernorate: created.originGovernorate,
      carbonKgPerTonne: created.carbonKgPerTonne,
      issuedAt: nowIso(),
    },
    { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
  );

  return { data: created, synthetic: true };
}
