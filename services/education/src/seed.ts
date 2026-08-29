/**
 * SYNTHETIC DATA — Adaptive Education OS
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type School } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /schools. */
export function makeSchool(rng: () => number, index: number): Omit<School, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `School ${index + 1} — ${gov.name}`,
    level: pick(['primary', 'secondary', 'vocational', 'university'] as const, rng),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    pupils: Math.round(rng() * 800) + 20,
    teachers: Math.round(rng() * 100),
    buildingCondition: Number(rng().toFixed(3)),
    airQualityIndex: Number((rng() * 100).toFixed(2)),
    digitalReadiness: Number(rng().toFixed(3)),
    dropoutRate: Number(rng().toFixed(3)),
    synthetic: true,
  };
}

export function twinIdFor(row: School): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: School): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'school',
    label: row.label,
    location: row.location,
    state: {
      buildingCondition: row.buildingCondition,
      dropoutRate: row.dropoutRate,
      digitalReadiness: row.digitalReadiness,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('education:schools:v1');
  const rows = ctx.db
    .collection<School>(COLLECTION)
    .insertMany(Array.from({ length: 42 }, (_, index) => makeSchool(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic schools`);
}
