/**
 * Tourism Digital Twin — Tunisia Immersive Tourism OS
 *
 * Site capacity, pressure and seasonality.
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
  nowIso,
  signalSources,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Site } from '../domain.ts';
import { makeSite, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'tourism-digital-twin',
  name: 'Tourism Digital Twin',
  purpose: 'Site capacity, pressure and seasonality.',
} as const;

/** List every tourism site this ministry owns. */
export function listSites(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Site>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One tourism site, with its digital twin. */
export function getSite(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Site>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Tourism site', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a tourism site. Any field you omit is filled with a plausible synthetic value. */
export async function createSite(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Site>(COLLECTION);
  const rng = seededRandom(`tourism:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeSite(rng, rows.count()), ...(req.body as Partial<Site>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}

/** Visitor pressure by governorate. */
export async function getFlows(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Site>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    capacity: avg(groupRows_, 'capacity'),
    visitorsWeek: avg(groupRows_, 'visitorsWeek'),
    pressureIndex: avg(groupRows_, 'pressureIndex'),
    arScenes: avg(groupRows_, 'arScenes'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Site[];
    await ctx.publish(
      'tourism.visitor-flow.updated.v1',
      {
        siteId: newId('site'),
        governorate: key,
        visitorsWeek: Math.round(avg(rows, 'visitorsWeek')),
        originMix: signalSources(ctx),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
