/**
 * National Research Brain — Tunisia Research Brain
 *
 * Projects, disciplines, maturity, findings.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { seededRandom } from '@platform/geo';
import {
  NotFoundError,
  nowIso,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Project } from '../domain.ts';
import { makeProject, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'national-research-brain',
  name: 'National Research Brain',
  purpose: 'Projects, disciplines, maturity, findings.',
} as const;

/** List every research project this ministry owns. */
export function listProjects(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Project>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One research project, with its digital twin. */
export function getProject(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Project>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Research project', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a research project. Any field you omit is filled with a plausible synthetic value. */
export async function createProject(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Project>(COLLECTION);
  const rng = seededRandom(`research:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeProject(rng, rows.count()), ...(req.body as Partial<Project>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish(
    'research.project.published.v1',
    {
      projectId: created.id,
      title: created.label,
      discipline: created.discipline,
      governorate: created.governorate,
      trl: created.trl,
      publishedAt: nowIso(),
    },
    { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
  );

  return { data: created, synthetic: true };
}
