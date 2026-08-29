/**
 * National Mobility Digital Twin — Autonomous Mobility & Logistics Grid
 *
 * Flows, congestion and demand by corridor.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { newId } from '@platform/observability';
import {
  NotFoundError,
  avg,
  groupRows,
  nowIso,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Resource } from '../domain.ts';
import { twinIdFor } from '../seed.ts';

export const MODULE = {
  id: 'national-mobility-digital-twin',
  name: 'National Mobility Digital Twin',
  purpose: 'Flows, congestion and demand by corridor.',
} as const;

/** List every transport resource this ministry owns. */
export function listResources(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Resource>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One transport resource, with its digital twin. */
export function getResource(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Resource>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Transport resource', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Mobility demand by governorate. */
export async function getFlows(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Resource>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    capacity: avg(groupRows_, 'capacity'),
    etaMinutes: avg(groupRows_, 'etaMinutes'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Resource[];
    await ctx.publish(
      'transport.mobility-demand.updated.v1',
      {
        corridorId: newId('corridor'),
        governorate: key,
        demandIndex: Number(Math.min(1, rows.length / 20).toFixed(3)),
        congestionIndex: Number(Math.min(1, rows.length / 20).toFixed(3)),
        mode: key,
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
