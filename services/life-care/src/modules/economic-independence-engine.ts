/**
 * Economic Independence Engine — Life & Care Intelligence OS
 *
 * The concrete path from support to autonomy.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { newId } from '@platform/observability';
import { avg, groupRows, nowIso, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Facility } from '../domain.ts';

export const MODULE = {
  id: 'economic-independence-engine',
  name: 'Economic Independence Engine',
  purpose: 'The concrete path from support to autonomy.',
} as const;

/** Care coverage by governorate. */
export async function getCoverage(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Facility>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    capacity: avg(groupRows_, 'capacity'),
    occupied: avg(groupRows_, 'occupied'),
    waitingList: avg(groupRows_, 'waitingList'),
    independenceScore: avg(groupRows_, 'independenceScore'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Facility[];
    await ctx.publish(
      'care.facility-capacity.updated.v1',
      {
        facilityId: newId('facility'),
        governorate: key,
        capacity: Math.round(avg(rows, 'capacity')),
        occupied: Math.round(avg(rows, 'occupied')),
        waitingList: Math.round(avg(rows, 'waitingList')),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
