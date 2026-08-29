/**
 * AI Road Safety Grid — National Safety & Emergency Grid
 *
 * Continuous risk scoring of road segments.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { newId } from '@platform/observability';
import {
  avg,
  groupRows,
  nowIso,
  signalSources,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Incident } from '../domain.ts';

export const MODULE = {
  id: 'ai-road-safety-grid',
  name: 'AI Road Safety Grid',
  purpose: 'Continuous risk scoring of road segments.',
} as const;

/** Road risk by governorate, blending incidents with weather and traffic signals. */
export async function getRoadRisk(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Incident>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    casualties: avg(groupRows_, 'casualties'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Incident[];
    await ctx.publish(
      'emergency.road-risk.updated.v1',
      {
        segmentId: newId('segment'),
        governorate: key,
        riskScore: Number(Math.min(1, rows.length / 20).toFixed(3)),
        drivers: signalSources(ctx),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
