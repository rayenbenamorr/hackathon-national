/**
 * National Supply Graph — Smart Trade Network
 *
 * Dependencies between products, inputs and corridors.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { avg, groupRows, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Product } from '../domain.ts';

export const MODULE = {
  id: 'national-supply-graph',
  name: 'National Supply Graph',
  purpose: 'Dependencies between products, inputs and corridors.',
} as const;

/** Export concentration by governorate of origin. */
export async function getSupplyGraph(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Product>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'originGovernorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    originGovernorate: key,
    count: groupRows_.length,
    annualTonnes: avg(groupRows_, 'annualTonnes'),
    exportShare: avg(groupRows_, 'exportShare'),
    carbonKgPerTonne: avg(groupRows_, 'carbonKgPerTonne'),
  }));
  items.sort((a, b) => b.count - a.count);

  return { groupedBy: 'originGovernorate', items, total: rows.length, synthetic: true };
}
