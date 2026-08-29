/**
 * SYNTHETIC DATA — Autonomous Food & Water Grid
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Farm } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /farms. */
export function makeFarm(rng: () => number, index: number): Omit<Farm, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Farm ${index + 1} — ${gov.name}`,
    crop: pick(
      ['olive', 'date', 'cereal', 'citrus', 'vegetable', 'forage', 'vine', 'greenhouse'] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    areaHectares: Number((rng() * 120 + 1).toFixed(2)),
    soilMoisturePct: Number((rng() * 100).toFixed(1)),
    irrigationType: pick(['drip', 'sprinkler', 'flood', 'rainfed'] as const, rng),
    waterDemandM3Day: Math.round(rng() * 5000),
    yieldForecastTonnes: Number((rng() * 900).toFixed(1)),
    stressIndex: Number(rng().toFixed(3)),
    synthetic: true,
  };
}

export function twinIdFor(row: Farm): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Farm): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'farm',
    label: row.label,
    location: row.location,
    state: {
      soilMoisturePct: row.soilMoisturePct,
      stressIndex: row.stressIndex,
      waterDemandM3Day: row.waterDemandM3Day,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('food-water:farms:v1');
  const rows = ctx.db
    .collection<Farm>(COLLECTION)
    .insertMany(Array.from({ length: 44 }, (_, index) => makeFarm(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic farms`);
}
