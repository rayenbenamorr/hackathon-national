/**
 * SYNTHETIC DATA — Tunisia Immersive Tourism OS
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Site } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /sites. */
export function makeSite(rng: () => number, index: number): Omit<Site, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Tourism site ${index + 1} — ${gov.name}`,
    assetType: pick(
      ['hotel', 'beach', 'medina', 'archaeological', 'oasis', 'trail', 'festival', 'museum'] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    capacity: Math.round(rng() * 800) + 20,
    visitorsWeek: Math.round(rng() * 800) + 20,
    pressureIndex: Number(rng().toFixed(3)),
    seasonality: pick(['year-round', 'summer', 'winter', 'event'] as const, rng),
    arScenes: Math.round(rng() * 100),
    synthetic: true,
  };
}

export function twinIdFor(row: Site): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Site): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'facility',
    label: row.label,
    location: row.location,
    state: {
      pressureIndex: row.pressureIndex,
      visitorsWeek: row.visitorsWeek,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('tourism:sites:v1');
  const rows = ctx.db
    .collection<Site>(COLLECTION)
    .insertMany(Array.from({ length: 36 }, (_, index) => makeSite(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic sites`);
}
