/**
 * SYNTHETIC DATA — Intelligent Treasury OS
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type BudgetLine } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /budgetLines. */
export function makeBudgetLine(rng: () => number, index: number): Omit<BudgetLine, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Budget line ${index + 1} — ${gov.name}`,
    programme: `${gov.name} programme ${index + 1}`,
    ministry: pick(['Finance', 'Health', 'Transport', 'Environment', 'Education'] as const, rng),
    fiscalYear: Math.round(1950 + rng() * 70),
    allocatedTnd: Math.round(rng() * 900000),
    committedTnd: Math.round(rng() * 900000),
    governorate: gov.code,
    instrument: pick(['budget-line', 'grant', 'subsidy', 'loan', 'guarantee', 'aid-wallet'] as const, rng),
    priority: pick(['low', 'standard', 'high', 'emergency'] as const, rng),
    synthetic: true,
  };
}

export function twinIdFor(row: BudgetLine): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: BudgetLine): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'process',
    label: row.label,
    state: {
      committedTnd: row.committedTnd,
      priority: row.priority,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('treasury:budgetLines:v1');
  const rows = ctx.db
    .collection<BudgetLine>(COLLECTION)
    .insertMany(Array.from({ length: 48 }, (_, index) => makeBudgetLine(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic budgetLines`);
}
