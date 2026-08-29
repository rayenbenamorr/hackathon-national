/**
 * Smart Heritage Sensor Network — Smart Religious Heritage Network
 *
 * Humidity, strain and vibration on fragile fabric.
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
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Site } from '../domain.ts';
import { makeSite, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'smart-heritage-sensor-network',
  name: 'Smart Heritage Sensor Network',
  purpose: 'Humidity, strain and vibration on fragile fabric.',
} as const;

/** List every heritage site this ministry owns. */
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

/** One heritage site, with its digital twin. */
export function getSite(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Site>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Heritage site', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a heritage site. Any field you omit is filled with a plausible synthetic value. */
export async function createSite(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Site>(COLLECTION);
  const rng = seededRandom(`religious-heritage:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeSite(rng, rows.count()), ...(req.body as Partial<Site>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}

/** Site condition by governorate. */
export async function getSitesCondition(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Site>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    builtCentury: avg(groupRows_, 'builtCentury'),
    conditionIndex: avg(groupRows_, 'conditionIndex'),
    humidityPct: avg(groupRows_, 'humidityPct'),
    vibrationMmS: avg(groupRows_, 'vibrationMmS'),
    energyKwhMonth: avg(groupRows_, 'energyKwhMonth'),
    visitorsWeek: avg(groupRows_, 'visitorsWeek'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Site[];
    await ctx.publish(
      'heritage.site-condition.updated.v1',
      {
        siteId: newId('site'),
        governorate: key,
        conditionIndex: avg(rows, 'conditionIndex'),
        humidityPct: avg(rows, 'humidityPct'),
        vibrationMmS: avg(rows, 'vibrationMmS'),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
