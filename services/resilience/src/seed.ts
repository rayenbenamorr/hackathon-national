/**
 * SYNTHETIC DATA — National Resilience Command System
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Cris } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /crises. */
export function makeCris(rng: () => number, index: number): Omit<Cris, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Crisis ${index + 1} — ${gov.name}`,
    kind: pick(
      ['flood', 'drought', 'earthquake', 'fire', 'epidemic', 'industrial', 'storm', 'power-failure'] as const,
      rng,
    ),
    severity: pick(['watch', 'alert', 'major', 'catastrophic'] as const, rng),
    status: pick(['declared', 'responding', 'stabilised', 'closed'] as const, rng),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    declaredAt: new Date(Date.now() - Math.round(rng() * 90) * 86400000).toISOString(),
    affectedPeople: Math.round(rng() * 800) + 20,
    peopleAtRisk: Math.round(rng() * 800) + 20,
    synthetic: true,
  };
}

export function twinIdFor(row: Cris): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Cris): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'region',
    label: row.label,
    location: row.location,
    state: {
      status: row.status,
      severity: row.severity,
      affectedPeople: row.affectedPeople,
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('resilience:crises:v1');
  const rows = ctx.db
    .collection<Cris>(COLLECTION)
    .insertMany(Array.from({ length: 8 }, (_, index) => makeCris(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic crises`);
}
