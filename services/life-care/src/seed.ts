/**
 * SYNTHETIC DATA — Life & Care Intelligence OS
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
    label: `Care facility ${index + 1} — ${gov.name}`,
    facilityType: pick(
      ['nursery', 'childrens-centre', 'womens-centre', 'elder-home', 'day-care', 'shelter'] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    capacity: Math.round(rng() * 800) + 20,
    occupied: Math.round(rng() * 100),
    waitingList: Math.round(rng() * 100),
    independenceScore: Number(rng().toFixed(3)),
    services: pickMany(['day-care', 'counselling', 'meals', 'transport', 'training'] as const, rng, 2),
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
      occupied: row.occupied,
      waitingList: row.waitingList,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('life-care:facilities:v1');
  const rows = ctx.db
    .collection<Facility>(COLLECTION)
    .insertMany(Array.from({ length: 32 }, (_, index) => makeFacility(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic facilities`);
}
