/**
 * Living Lab Tunisia — Tunisia Research Brain
 *
 * Real-territory pilots with instrumented outcomes.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { avg, groupRows, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Project } from '../domain.ts';

export const MODULE = {
  id: 'living-lab-tunisia',
  name: 'Living Lab Tunisia',
  purpose: 'Real-territory pilots with instrumented outcomes.',
} as const;

/** Research capability by discipline. */
export async function getCapability(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Project>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'discipline');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    discipline: key,
    count: groupRows_.length,
    trl: avg(groupRows_, 'trl'),
    budgetTnd: avg(groupRows_, 'budgetTnd'),
  }));
  items.sort((a, b) => b.count - a.count);

  return { groupedBy: 'discipline', items, total: rows.length, synthetic: true };
}
