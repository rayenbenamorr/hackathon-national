/**
 * Emergency Mesh Network — National Resilience Command System
 *
 * Store-and-forward node health when normal connectivity is gone.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { avg, groupRows, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Cris } from '../domain.ts';

export const MODULE = {
  id: 'emergency-mesh-network',
  name: 'Emergency Mesh Network',
  purpose: 'Store-and-forward node health when normal connectivity is gone.',
} as const;

/** Mesh node reachability by governorate. */
export async function getMeshNodes(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Cris>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    affectedPeople: avg(groupRows_, 'affectedPeople'),
    peopleAtRisk: avg(groupRows_, 'peopleAtRisk'),
  }));
  items.sort((a, b) => b.count - a.count);

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
