/**
 * SYNTHETIC DATA — Tunisia Cultural Intelligence Network
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
    label: `Cultural asset ${index + 1} — ${gov.name}`,
    assetType: pick(
      ['monument', 'museum', 'manuscript', 'craft', 'performance', 'site', 'archive'] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    period: pick(['punic', 'roman', 'aghlabid', 'hafsid', 'ottoman', 'modern'] as const, rng),
    conditionIndex: Number(rng().toFixed(3)),
    visitorsMonth: Math.round(rng() * 800) + 20,
    digitised: rng() > 0.45,
    protectionStatus: pick(['none', 'national', 'unesco', 'at-risk'] as const, rng),
    synthetic: true,
  };
}

export function twinIdFor(row: Asset): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Asset): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'heritage-site',
    label: row.label,
    location: row.location,
    state: {
      conditionIndex: row.conditionIndex,
      visitorsMonth: row.visitorsMonth,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('culture:assets:v1');
  const rows = ctx.db
    .collection<Asset>(COLLECTION)
    .insertMany(Array.from({ length: 38 }, (_, index) => makeAsset(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic assets`);
}
