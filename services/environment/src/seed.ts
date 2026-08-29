/**
 * SYNTHETIC DATA — Environmental Nervous System
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Station } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /stations. */
export function makeStation(rng: () => number, index: number): Omit<Station, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Environmental station ${index + 1} — ${gov.name}`,
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    pm25: Number((rng() * 80).toFixed(1)),
    no2: Number((rng() * 80).toFixed(1)),
    waterTurbidity: Number((rng() * 80).toFixed(1)),
    noiseDb: Number((rng() * 80).toFixed(1)),
    temperature: Number((14 + rng() * 24).toFixed(1)),
    climateRisk: Number(rng().toFixed(3)),
    droughtIndex: Number(rng().toFixed(3)),
    synthetic: true,
  };
}

export function twinIdFor(row: Station): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Station): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'environment-system',
    label: row.label,
    location: row.location,
    state: {
      pm25: row.pm25,
      climateRisk: row.climateRisk,
      droughtIndex: row.droughtIndex,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('environment:stations:v1');
  const rows = ctx.db
    .collection<Station>(COLLECTION)
    .insertMany(Array.from({ length: 40 }, (_, index) => makeStation(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic stations`);
}
