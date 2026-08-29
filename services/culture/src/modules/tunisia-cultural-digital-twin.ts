/**
 * Tunisia Cultural Digital Twin — Tunisia Cultural Intelligence Network
 *
 * Condition and use of every cultural asset.
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
  id: 'tunisia-cultural-digital-twin',
  name: 'Tunisia Cultural Digital Twin',
  purpose: 'Condition and use of every cultural asset.',
} as const;

/** List every cultural asset this ministry owns. */
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

/** One cultural asset, with its digital twin. */
export function getAsset(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Asset>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Cultural asset', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a cultural asset. Any field you omit is filled with a plausible synthetic value. */
export async function createAsset(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Asset>(COLLECTION);
  const rng = seededRandom(`culture:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeAsset(rng, rows.count()), ...(req.body as Partial<Asset>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}

/** Cultural asset condition by governorate. */
export async function getAssetsCondition(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Asset>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    conditionIndex: avg(groupRows_, 'conditionIndex'),
    visitorsMonth: avg(groupRows_, 'visitorsMonth'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Asset[];
    await ctx.publish(
      'culture.asset-condition.updated.v1',
      {
        assetId: newId('asset'),
        governorate: key,
        conditionIndex: avg(rows, 'conditionIndex'),
        protectionStatus: mode(rows, 'protectionStatus'),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
