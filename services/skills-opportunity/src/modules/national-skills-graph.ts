/**
 * National Skills Graph — National Skills & Opportunity OS
 *
 * Skills, adjacencies and regional supply.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import {
  NotFoundError,
  avg,
  groupRows,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Skill } from '../domain.ts';
import { twinIdFor } from '../seed.ts';

export const MODULE = {
  id: 'national-skills-graph',
  name: 'National Skills Graph',
  purpose: 'Skills, adjacencies and regional supply.',
} as const;

/** List every skill this ministry owns. */
export function listSkills(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Skill>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One skill, with its digital twin. */
export function getSkill(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Skill>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Skill', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Skill gaps by governorate. */
export async function getGaps(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Skill>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    supplyIndex: avg(groupRows_, 'supplyIndex'),
    demandIndex: avg(groupRows_, 'demandIndex'),
    gap: avg(groupRows_, 'gap'),
    trainingMonths: avg(groupRows_, 'trainingMonths'),
  }));
  items.sort((a, b) => b.count - a.count);

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
