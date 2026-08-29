/**
 * Smart Hospital Operating System — Connected Health Intelligence System
 *
 * Beds, ICU, emergency load, in real time.
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
import { COLLECTION, type Facility } from '../domain.ts';
import { twinIdFor } from '../seed.ts';

export const MODULE = {
  id: 'smart-hospital-operating-system',
  name: 'Smart Hospital Operating System',
  purpose: 'Beds, ICU, emergency load, in real time.',
} as const;

/** List every health facility this ministry owns. */
export function listFacilities(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Facility>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One health facility, with its digital twin. */
export function getFacility(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Facility>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Health facility', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Capacity by governorate. The endpoint every dispatcher calls. */
export async function getCapacity(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Facility>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    totalBeds: avg(groupRows_, 'totalBeds'),
    availableBeds: avg(groupRows_, 'availableBeds'),
    icuAvailable: avg(groupRows_, 'icuAvailable'),
    emergencyLoad: avg(groupRows_, 'emergencyLoad'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Facility[];
    await ctx.publish(
      'health.capacity.updated.v1',
      {
        facilityId: newId('facility'),
        governorate: key,
        location: rows[0]?.location,
        totalBeds: Math.round(avg(rows, 'totalBeds')),
        availableBeds: Math.round(avg(rows, 'availableBeds')),
        icuAvailable: Math.round(avg(rows, 'icuAvailable')),
        emergencyLoad: avg(rows, 'emergencyLoad'),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
