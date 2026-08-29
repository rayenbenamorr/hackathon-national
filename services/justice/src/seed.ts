/**
 * SYNTHETIC DATA — Justice Intelligence OS
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Cas } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /cases. */
export function makeCas(rng: () => number, index: number): Omit<Cas, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Case ${index + 1} — ${gov.name}`,
    reference: `REF-${gov.code.slice(3)}-${String(index + 1).padStart(4, '0')}`,
    matter: pick(['civil', 'commercial', 'administrative', 'labour', 'family', 'penal'] as const, rng),
    court: `Court of ${gov.name}`,
    stage: pick(['filed', 'instruction', 'hearing', 'deliberation', 'decided', 'appealed'] as const, rng),
    openedAt: new Date(Date.now() - Math.round(rng() * 90) * 86400000).toISOString(),
    delayDays: Math.max(1, Math.round(rng() * 30)),
    complexity: Number(rng().toFixed(3)),
    governorate: gov.code,
    synthetic: true,
  };
}

export function twinIdFor(row: Cas): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Cas): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'process',
    label: row.label,
    state: {
      stage: row.stage,
      delayDays: row.delayDays,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('justice:cases:v1');
  const rows = ctx.db
    .collection<Cas>(COLLECTION)
    .insertMany(Array.from({ length: 40 }, (_, index) => makeCas(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic cases`);
}
