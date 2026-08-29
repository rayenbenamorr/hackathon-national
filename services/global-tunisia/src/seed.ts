/**
 * SYNTHETIC DATA — Global Tunisia Network
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Consulate } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /consulates. */
export function makeConsulate(rng: () => number, index: number): Omit<Consulate, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Consular post ${index + 1} — ${gov.name}`,
    country: pick(['France', 'Italy', 'Germany', 'Canada', 'Qatar'] as const, rng),
    city: pick(['Paris', 'Milan', 'Berlin', 'Montreal', 'Doha'] as const, rng),
    cohortSize: Math.round(rng() * 800) + 20,
    pendingRequests: Math.round(rng() * 100),
    averageProcessingDays: Math.max(1, Math.round(rng() * 30)),
    topSkills: pickMany(
      ['software', 'medicine', 'civil-engineering', 'finance', 'agronomy'] as const,
      rng,
      2,
    ),
    load: Number(rng().toFixed(3)),
    synthetic: true,
  };
}

export function twinIdFor(row: Consulate): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Consulate): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'facility',
    label: row.label,
    state: {
      load: row.load,
      pendingRequests: row.pendingRequests,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('global-tunisia:consulates:v1');
  const rows = ctx.db
    .collection<Consulate>(COLLECTION)
    .insertMany(Array.from({ length: 16 }, (_, index) => makeConsulate(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic consulates`);
}
