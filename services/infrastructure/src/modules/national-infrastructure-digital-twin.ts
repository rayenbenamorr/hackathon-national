/**
 * National Infrastructure Digital Twin — Smart Infrastructure OS
 *
 * Health per asset, continuously.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { newId } from '@platform/observability';
import { seededRandom } from '@platform/geo';
import {
  NotFoundError,
  avg,
  groupRows,
  mode,
  nowIso,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Asset } from '../domain.ts';
import { makeAsset, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'national-infrastructure-digital-twin',
  name: 'National Infrastructure Digital Twin',
  purpose: 'Health per asset, continuously.',
} as const;

/** List every infrastructure asset this ministry owns. */
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

/** One infrastructure asset, with its digital twin. */
export function getAsset(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Asset>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Infrastructure asset', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a infrastructure asset. Any field you omit is filled with a plausible synthetic value. */
export async function createAsset(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Asset>(COLLECTION);
  const rng = seededRandom(`infrastructure:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeAsset(rng, rows.count()), ...(req.body as Partial<Asset>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}

/** Asset health by governorate. */
export async function getAssetsHealth(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Asset>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    commissionedYear: avg(groupRows_, 'commissionedYear'),
    healthIndex: avg(groupRows_, 'healthIndex'),
    strainMicro: avg(groupRows_, 'strainMicro'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Asset[];
    await ctx.publish(
      'infrastructure.asset-health.updated.v1',
      {
        assetId: newId('asset'),
        assetType: mode(rows, 'assetType'),
        governorate: key,
        healthIndex: avg(rows, 'healthIndex'),
        criticality: mode(rows, 'criticality'),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
