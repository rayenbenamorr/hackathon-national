/**
 * National Environmental Sensor Network — Environmental Nervous System
 *
 * Air, water and noise observations everywhere.
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
import { COLLECTION, type Station } from '../domain.ts';
import { makeStation, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'national-environmental-sensor-network',
  name: 'National Environmental Sensor Network',
  purpose: 'Air, water and noise observations everywhere.',
} as const;

/** List every environmental station this ministry owns. */
export function listStations(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Station>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One environmental station, with its digital twin. */
export function getStation(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Station>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Environmental station', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a environmental station. Any field you omit is filled with a plausible synthetic value. */
export async function createStation(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Station>(COLLECTION);
  const rng = seededRandom(`environment:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeStation(rng, rows.count()), ...(req.body as Partial<Station>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}

/** Air quality by governorate. */
export async function getAirQuality(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Station>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    pm25: avg(groupRows_, 'pm25'),
    no2: avg(groupRows_, 'no2'),
    waterTurbidity: avg(groupRows_, 'waterTurbidity'),
    noiseDb: avg(groupRows_, 'noiseDb'),
    temperature: avg(groupRows_, 'temperature'),
    climateRisk: avg(groupRows_, 'climateRisk'),
    droughtIndex: avg(groupRows_, 'droughtIndex'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Station[];
    await ctx.publish(
      'environment.air-quality.updated.v1',
      {
        stationId: newId('station'),
        governorate: key,
        location: rows[0]?.location,
        pm25: avg(rows, 'pm25'),
        no2: avg(rows, 'no2'),
        airQualityIndex: Number(rows.length.toFixed(1)),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
