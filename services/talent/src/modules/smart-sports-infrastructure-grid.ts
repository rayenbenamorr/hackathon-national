/**
 * Smart Sports Infrastructure Grid — National Talent Intelligence Network
 *
 * Facility usage, condition and energy.
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
import { COLLECTION, type Facility } from '../domain.ts';
import { makeFacility, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'smart-sports-infrastructure-grid',
  name: 'Smart Sports Infrastructure Grid',
  purpose: 'Facility usage, condition and energy.',
} as const;

/** List every sports facility this ministry owns. */
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

/** One sports facility, with its digital twin. */
export function getFacility(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Facility>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Sports facility', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a sports facility. Any field you omit is filled with a plausible synthetic value. */
export async function createFacility(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Facility>(COLLECTION);
  const rng = seededRandom(`talent:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeFacility(rng, rows.count()), ...(req.body as Partial<Facility>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}

/** Facility usage by governorate. */
export async function getFacilitiesUsage(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Facility>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    capacity: avg(groupRows_, 'capacity'),
    weeklyUsers: avg(groupRows_, 'weeklyUsers'),
    condition: avg(groupRows_, 'condition'),
    energyKwhMonth: avg(groupRows_, 'energyKwhMonth'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Facility[];
    await ctx.publish(
      'talent.facility-usage.updated.v1',
      {
        facilityId: newId('facility'),
        governorate: key,
        weeklyUsers: Math.round(avg(rows, 'weeklyUsers')),
        condition: avg(rows, 'condition'),
        energyKwhMonth: avg(rows, 'energyKwhMonth'),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
