/**
 * Smart School IoT — Adaptive Education OS
 *
 * Air quality, occupancy and building condition per school.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { newId } from '@platform/observability';
import { seededRandom } from '@platform/geo';
import {
  NotFoundError,
  avg,
  groupRows,
  nowIso,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type School } from '../domain.ts';
import { makeSchool, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'smart-school-iot',
  name: 'Smart School IoT',
  purpose: 'Air quality, occupancy and building condition per school.',
} as const;

/** List every school this ministry owns. */
export function listSchools(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<School>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One school, with its digital twin. */
export function getSchool(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<School>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('School', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a school. Any field you omit is filled with a plausible synthetic value. */
export async function createSchool(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<School>(COLLECTION);
  const rng = seededRandom(`education:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeSchool(rng, rows.count()), ...(req.body as Partial<School>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  return { data: created, synthetic: true };
}

/** School condition by governorate. */
export async function getSchoolsCondition(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<School>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'governorate');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    governorate: key,
    count: groupRows_.length,
    pupils: avg(groupRows_, 'pupils'),
    teachers: avg(groupRows_, 'teachers'),
    buildingCondition: avg(groupRows_, 'buildingCondition'),
    airQualityIndex: avg(groupRows_, 'airQualityIndex'),
    digitalReadiness: avg(groupRows_, 'digitalReadiness'),
    dropoutRate: avg(groupRows_, 'dropoutRate'),
  }));
  items.sort((a, b) => b.count - a.count);

  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as School[];
    await ctx.publish(
      'education.school-condition.updated.v1',
      {
        schoolId: newId('school'),
        governorate: key,
        buildingCondition: avg(rows, 'buildingCondition'),
        airQualityIndex: avg(rows, 'airQualityIndex'),
        pupils: Math.round(avg(rows, 'pupils')),
        observedAt: nowIso(),
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );
  }

  return { groupedBy: 'governorate', items, total: rows.length, synthetic: true };
}
