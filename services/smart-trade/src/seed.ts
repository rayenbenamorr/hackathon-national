/**
 * SYNTHETIC DATA — Smart Trade Network
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Product } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /products. */
export function makeProduct(rng: () => number, index: number): Omit<Product, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Product ${index + 1} — ${gov.name}`,
    category: pick(
      [
        'olive-oil',
        'dates',
        'textile',
        'phosphate',
        'seafood',
        'electronics',
        'automotive-parts',
        'handicraft',
        'pharma',
      ] as const,
      rng,
    ),
    hsCode: String(1000 + Math.round(rng() * 8999)),
    originGovernorate: gov.code,
    annualTonnes: Number((rng() * 900).toFixed(1)),
    exportShare: Number(rng().toFixed(3)),
    carbonKgPerTonne: Number((rng() * 900).toFixed(1)),
    certified: rng() > 0.45,
    synthetic: true,
  };
}

export function twinIdFor(row: Product): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Product): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'process',
    label: row.label,
    state: {
      exportShare: row.exportShare,
      certified: row.certified,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('smart-trade:products:v1');
  const rows = ctx.db
    .collection<Product>(COLLECTION)
    .insertMany(Array.from({ length: 30 }, (_, index) => makeProduct(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic products`);
}
