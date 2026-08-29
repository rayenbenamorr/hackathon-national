/**
 * SYNTHETIC DATA — Smart Religious Heritage Network
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
    label: `Heritage site ${index + 1} — ${gov.name}`,
    siteType: pick(['mosque', 'zaouia', 'madrasa', 'library', 'cemetery', 'shrine'] as const, rng),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    builtCentury: Math.round(1950 + rng() * 70),
    conditionIndex: Number(rng().toFixed(3)),
    humidityPct: Number((rng() * 100).toFixed(1)),
    vibrationMmS: Number((rng() * 100).toFixed(2)),
    energyKwhMonth: Math.round(rng() * 40000),
    visitorsWeek: Math.round(rng() * 800) + 20,
    synthetic: true,
  };
}

export function twinIdFor(row: Site): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Site): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'heritage-site',
    label: row.label,
    location: row.location,
    state: {
      conditionIndex: row.conditionIndex,
      humidityPct: row.humidityPct,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('religious-heritage:sites:v1');
  const rows = ctx.db
    .collection<Site>(COLLECTION)
    .insertMany(Array.from({ length: 28 }, (_, index) => makeSite(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic sites`);
}
