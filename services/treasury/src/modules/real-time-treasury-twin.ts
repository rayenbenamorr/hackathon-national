/**
 * Real-Time Treasury Twin — Intelligent Treasury OS
 *
 * Live position of every budget line.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
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
import { COLLECTION, type BudgetLine } from '../domain.ts';
import { makeBudgetLine, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'real-time-treasury-twin',
  name: 'Real-Time Treasury Twin',
  purpose: 'Live position of every budget line.',
} as const;

/** List every budget line this ministry owns. */
export function listBudgetLines(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<BudgetLine>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One budget line, with its digital twin. */
export function getBudgetLine(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<BudgetLine>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Budget line', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a budget line. Any field you omit is filled with a plausible synthetic value. */
export async function createBudgetLine(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<BudgetLine>(COLLECTION);
  const rng = seededRandom(`treasury:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeBudgetLine(rng, rows.count()), ...(req.body as Partial<BudgetLine>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish(
    'treasury.budget-line.updated.v1',
    {
      lineId: created.id,
      programme: created.programme,
      ministry: created.ministry,
      allocatedTnd: created.allocatedTnd,
      committedTnd: created.committedTnd,
      governorate: created.governorate,
      updatedAt: nowIso(),
    },
    { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
  );

  return { data: created, synthetic: true };
}

/** Commitment rate by ministry. */
export async function getPosition(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<BudgetLine>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, 'ministry');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    ministry: key,
    count: groupRows_.length,
    fiscalYear: avg(groupRows_, 'fiscalYear'),
    allocatedTnd: avg(groupRows_, 'allocatedTnd'),
    committedTnd: avg(groupRows_, 'committedTnd'),
  }));
  items.sort((a, b) => b.count - a.count);

  return { groupedBy: 'ministry', items, total: rows.length, synthetic: true };
}
