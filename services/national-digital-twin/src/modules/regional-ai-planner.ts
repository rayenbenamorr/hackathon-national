/**
 * Regional AI Planner — Tunisia National Digital Twin
 *
 * Investment and priority proposals per governorate.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import {
  avg,
  groupRows,
  mode,
  signalSources,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type RegionState } from '../domain.ts';

export const MODULE = {
  id: 'regional-ai-planner',
  name: 'Regional AI Planner',
  purpose: 'Investment and priority proposals per governorate.',
} as const;

/** Composite stress index per governorate, with the services that drove it. */
export async function getRegionsStress(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<RegionState>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    population: avg(groupRows_, 'population'),
    stressIndex: avg(groupRows_, 'stressIndex'),
    waterStress: avg(groupRows_, 'waterStress'),
    airQualityIndex: avg(groupRows_, 'airQualityIndex'),
    healthLoad: avg(groupRows_, 'healthLoad'),
    mobilityPressure: avg(groupRows_, 'mobilityPressure'),
    economicActivity: avg(groupRows_, 'economicActivity'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as RegionState[];
    await ctx.publish(
      'twin.state.updated.v1',
      {
        governorate: key,
        stressIndex: avg(rows, 'stressIndex'),
        drivers: signalSources(ctx),
        contributingServices: signalSources(ctx),
        updatedAt: mode(rows, 'updatedAt'),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
