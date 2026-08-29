/**
 * SYNTHETIC DATA — National Land Intelligence System
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Parcel } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /parcels. */
export function makeParcel(rng: () => number, index: number): Omit<Parcel, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Land parcel ${index + 1} — ${gov.name}`,
    zoning: pick(
      ['agricultural', 'residential', 'industrial', 'protected', 'touristic', 'public', 'unzoned'] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    areaHectares: Number((rng() * 120 + 1).toFixed(2)),
    ownership: pick(['public', 'private', 'collective', 'unknown'] as const, rng),
    currentUse: pick(['alpha', 'beta', 'gamma', 'delta'] as const, rng),
    suitabilityScore: Number(rng().toFixed(3)),
    floodRisk: Number(rng().toFixed(3)),
    synthetic: true,
  };
}

export function twinIdFor(row: Parcel): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Parcel): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'asset',
    label: row.label,
    location: row.location,
    state: {
      suitabilityScore: row.suitabilityScore,
      floodRisk: row.floodRisk,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('land:parcels:v1');
  const rows = ctx.db
    .collection<Parcel>(COLLECTION)
    .insertMany(Array.from({ length: 50 }, (_, index) => makeParcel(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic parcels`);
}
