/**
 * Social Mobility AI — Social Mobility OS
 *
 * What actually moves a cohort upward, by governorate.
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
import { COLLECTION, type Cohort } from '../domain.ts';

export const MODULE = {
  id: 'social-mobility-ai',
  name: 'Social Mobility AI',
  purpose: 'What actually moves a cohort upward, by governorate.',
} as const;

/** Vulnerability by governorate. */
export async function getVulnerability(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Cohort>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    size: avg(groupRows_, 'size'),
    vulnerabilityIndex: avg(groupRows_, 'vulnerabilityIndex'),
    employmentRate: avg(groupRows_, 'employmentRate'),
    schoolingRate: avg(groupRows_, 'schoolingRate'),
    healthAccess: avg(groupRows_, 'healthAccess'),
    housingQuality: avg(groupRows_, 'housingQuality'),
    benefitsActive: avg(groupRows_, 'benefitsActive'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as Cohort[];
    await ctx.publish(
      'social.vulnerability.updated.v1',
      {
        cohortId: newId('cohort'),
        governorate: key,
        vulnerabilityIndex: avg(rows, 'vulnerabilityIndex'),
        drivers: signalSources(ctx),
        size: Math.round(avg(rows, 'size')),
        updatedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
