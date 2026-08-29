/**
 * SYNTHETIC DATA — National Talent Intelligence Network
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Facility } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /facilities. */
export function makeFacility(rng: () => number, index: number): Omit<Facility, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Sports facility ${index + 1} — ${gov.name}`,
    facilityType: pick(
      ['stadium', 'gymnasium', 'pool', 'athletics-track', 'training-centre', 'youth-club'] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    capacity: Math.round(rng() * 800) + 20,
    weeklyUsers: Math.round(rng() * 800) + 20,
    condition: Number(rng().toFixed(3)),
    energyKwhMonth: Math.round(rng() * 40000),
    disciplines: pickMany(['athletics', 'football', 'handball', 'swimming', 'judo'] as const, rng, 2),
    synthetic: true,
  };
}

export function twinIdFor(row: Facility): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Facility): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'facility',
    label: row.label,
    location: row.location,
    state: {
      condition: row.condition,
      weeklyUsers: row.weeklyUsers,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('talent:facilities:v1');
  const rows = ctx.db
    .collection<Facility>(COLLECTION)
    .insertMany(Array.from({ length: 30 }, (_, index) => makeFacility(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic facilities`);
}
