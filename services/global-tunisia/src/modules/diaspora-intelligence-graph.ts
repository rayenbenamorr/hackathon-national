/**
 * Diaspora Intelligence Graph — Global Tunisia Network
 *
 * Aggregate, privacy-safe picture of skills and presence abroad.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { avg, groupRows, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Consulate } from '../domain.ts';

export const MODULE = {
  id: 'diaspora-intelligence-graph',
  name: 'Diaspora Intelligence Graph',
  purpose: 'Aggregate, privacy-safe picture of skills and presence abroad.',
} as const;

/** Cohorts and skills by country. */
export async function getDiasporaStats(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Consulate>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'country');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    country: key,
    count: groupRows_.length,
    cohortSize: avg(groupRows_, 'cohortSize'),
    pendingRequests: avg(groupRows_, 'pendingRequests'),
    averageProcessingDays: avg(groupRows_, 'averageProcessingDays'),
    load: avg(groupRows_, 'load'),
  }));
  items.sort((a, b) => b.count - a.count);

  return { groupedBy: 'country', items, total: rows.length, synthetic: true };
}
