/**
 * SYNTHETIC DATA — Industrial & Energy Intelligence Grid
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
    label: `Industrial asset ${index + 1} — ${gov.name}`,
    sector: pick(
      [
        'cement',
        'textile',
        'chemicals',
        'agrifood',
        'mechanical',
        'electronics',
        'phosphate',
        'energy',
      ] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    outputTonnesDay: Number((rng() * 900).toFixed(1)),
    energyLoadMw: Number((rng() * 400).toFixed(1)),
    renewableShare: Number(rng().toFixed(3)),
    wasteStream: pick(['alpha', 'beta', 'gamma', 'delta'] as const, rng),
    condition: Number(rng().toFixed(3)),
    synthetic: true,
  };
}

export function twinIdFor(row: Asset): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Asset): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'asset',
    label: row.label,
    location: row.location,
    state: {
      energyLoadMw: row.energyLoadMw,
      condition: row.condition,
      renewableShare: row.renewableShare,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('industrial-energy:assets:v1');
  const rows = ctx.db
    .collection<Asset>(COLLECTION)
    .insertMany(Array.from({ length: 34 }, (_, index) => makeAsset(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic assets`);
}
