/**
 * Public Asset Intelligence — National Land Intelligence System
 *
 * What the State owns and whether it is used.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { avg, groupRows, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Parcel } from '../domain.ts';

export const MODULE = {
  id: 'public-asset-intelligence',
  name: 'Public Asset Intelligence',
  purpose: 'What the State owns and whether it is used.',
} as const;

/** Land pressure by governorate. */
export async function getParcelsPressure(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Parcel>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    areaHectares: avg(groupRows_, 'areaHectares'),
    suitabilityScore: avg(groupRows_, 'suitabilityScore'),
    floodRisk: avg(groupRows_, 'floodRisk'),
  }));
  items.sort((a, b) => b.count - a.count);

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
