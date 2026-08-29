/**
 * Industrial Digital Twin Network — Industrial & Energy Intelligence Grid
 *
 * Twin per industrial asset: output, consumption, condition.
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
import { COLLECTION, type Asset } from '../domain.ts';
import { makeAsset, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'industrial-digital-twin-network',
  name: 'Industrial Digital Twin Network',
  purpose: 'Twin per industrial asset: output, consumption, condition.',
} as const;

/** List every industrial asset this ministry owns. */
export function listAssets(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Asset>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One industrial asset, with its digital twin. */
export function getAsset(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Asset>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Industrial asset', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a industrial asset. Any field you omit is filled with a plausible synthetic value. */
export async function createAsset(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Asset>(COLLECTION);
  const rng = seededRandom(`industrial-energy:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeAsset(rng, rows.count()), ...(req.body as Partial<Asset>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish(
    'industry.production.updated.v1',
    {
      assetId: created.id,
      sector: created.sector,
      governorate: created.governorate,
      outputTonnesDay: created.outputTonnesDay,
      energyLoadMw: created.energyLoadMw,
      updatedAt: nowIso(),
    },
    { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
  );

  return { data: created, synthetic: true };
}
