/**
 * Justice Digital Twin — Justice Intelligence OS
 *
 * A live twin per court: pending load, average delay, saturation.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import {
  avg,
  groupRows,
  mode,
  nowIso,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Cas } from '../domain.ts';

export const MODULE = {
  id: 'justice-digital-twin',
  name: 'Justice Digital Twin',
  purpose: 'A live twin per court: pending load, average delay, saturation.',
} as const;

/** Pending load and saturation per court. */
export async function getCourtsLoad(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Cas>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'court');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    court: key,
    count: groupRows_.length,
    delayDays: avg(groupRows_, 'delayDays'),
    complexity: avg(groupRows_, 'complexity'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Cas[];
    await ctx.publish(
      'justice.court-load.updated.v1',
      {
        court: mode(rows, 'court'),
        governorate: key,
        pendingCases: rows.length,
        saturation: Number(Math.min(1, rows.length / 20).toFixed(3)),
        averageDelayDays: rows.length,
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'court', items, total: rows.length, synthetic: true };
}
