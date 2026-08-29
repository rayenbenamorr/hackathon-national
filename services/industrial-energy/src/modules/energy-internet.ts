/**
 * Energy Internet — Industrial & Energy Intelligence Grid
 *
 * Node-level load, generation and renewable share.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { newId } from '@platform/observability';
import { avg, groupRows, nowIso, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Asset } from '../domain.ts';

export const MODULE = {
  id: 'energy-internet',
  name: 'Energy Internet',
  purpose: 'Node-level load, generation and renewable share.',
} as const;

/** Load and renewable share by governorate. */
export async function getGridLoad(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Asset>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    outputTonnesDay: avg(groupRows_, 'outputTonnesDay'),
    energyLoadMw: avg(groupRows_, 'energyLoadMw'),
    renewableShare: avg(groupRows_, 'renewableShare'),
    condition: avg(groupRows_, 'condition'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Asset[];
    await ctx.publish(
      'energy.grid-load.updated.v1',
      {
        nodeId: newId('node'),
        governorate: key,
        loadMw: Number(rows.length.toFixed(1)),
        generationMw: Number(rows.length.toFixed(1)),
        renewableShare: avg(rows, 'renewableShare'),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
