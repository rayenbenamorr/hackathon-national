/**
 * SYNTHETIC DATA — Smart Infrastructure OS
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Asset } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /assets. */
export function makeAsset(rng: () => number, index: number): Omit<Asset, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Infrastructure asset ${index + 1} — ${gov.name}`,
    assetType: pick(
      [
        'road',
        'bridge',
        'water-network',
        'sewage',
        'power-line',
        'port',
        'rail',
        'building',
        'dam',
        'telecom-site',
      ] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    commissionedYear: Math.round(1950 + rng() * 70),
    healthIndex: Number(rng().toFixed(3)),
    criticality: pick(['low', 'medium', 'high', 'vital'] as const, rng),
    lastInspection: new Date(Date.now() - Math.round(rng() * 90) * 86400000).toISOString(),
    strainMicro: Math.round(rng() * 1200),
    synthetic: true,
  };
}

export function twinIdFor(row: Asset): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Asset): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'infrastructure',
    label: row.label,
    location: row.location,
    state: {
      healthIndex: row.healthIndex,
      criticality: row.criticality,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('infrastructure:assets:v1');
  const rows = ctx.db
    .collection<Asset>(COLLECTION)
    .insertMany(Array.from({ length: 46 }, (_, index) => makeAsset(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic assets`);
}
