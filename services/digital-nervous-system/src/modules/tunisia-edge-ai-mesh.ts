/**
 * Tunisia Edge AI Mesh — Tunisia Digital Nervous System
 *
 * Edge node health and locally-processed inference.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { avg, groupRows, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Sensor } from '../domain.ts';

export const MODULE = {
  id: 'tunisia-edge-ai-mesh',
  name: 'Tunisia Edge AI Mesh',
  purpose: 'Edge node health and locally-processed inference.',
} as const;

/** Sensor coverage by governorate. */
export async function getSensorsCoverage(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Sensor>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    lastValue: avg(groupRows_, 'lastValue'),
  }));
  items.sort((a, b) => b.count - a.count);

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
