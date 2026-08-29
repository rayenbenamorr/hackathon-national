/**
 * SYNTHETIC DATA — Social Mobility OS
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Cohort } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /cohorts. */
export function makeCohort(rng: () => number, index: number): Omit<Cohort, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Household cohort ${index + 1} — ${gov.name}`,
    governorate: gov.code,
    size: Math.round(rng() * 800) + 20,
    vulnerabilityIndex: Number(rng().toFixed(3)),
    employmentRate: Number(rng().toFixed(3)),
    schoolingRate: Number(rng().toFixed(3)),
    healthAccess: Number(rng().toFixed(3)),
    housingQuality: Number(rng().toFixed(3)),
    benefitsActive: Math.round(rng() * 100),
    synthetic: true,
  };
}

export function twinIdFor(row: Cohort): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Cohort): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'citizen-cohort',
    label: row.label,
    state: {
      vulnerabilityIndex: row.vulnerabilityIndex,
      benefitsActive: row.benefitsActive,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('social-mobility:cohorts:v1');
  const rows = ctx.db
    .collection<Cohort>(COLLECTION)
    .insertMany(Array.from({ length: 36 }, (_, index) => makeCohort(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic cohorts`);
}
