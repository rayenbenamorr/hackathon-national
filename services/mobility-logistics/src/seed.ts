/**
 * SYNTHETIC DATA — Autonomous Mobility & Logistics Grid
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Resource } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /resources. */
export function makeResource(rng: () => number, index: number): Omit<Resource, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Transport resource ${index + 1} — ${gov.name}`,
    resourceType: pick(
      ['ambulance', 'bus', 'truck', 'water-tanker', 'drone', 'boat', 'rail-unit'] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    status: pick(['available', 'engaged', 'maintenance', 'offline'] as const, rng),
    capacity: Number((rng() * 100).toFixed(2)),
    operator: `${gov.name} operator ${index + 1}`,
    etaMinutes: Math.max(1, Math.round(rng() * 30)),
    synthetic: true,
  };
}

export function twinIdFor(row: Resource): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Resource): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'vehicle',
    label: row.label,
    location: row.location,
    state: {
      status: row.status,
      etaMinutes: row.etaMinutes,
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('mobility-logistics:resources:v1');
  const rows = ctx.db
    .collection<Resource>(COLLECTION)
    .insertMany(Array.from({ length: 60 }, (_, index) => makeResource(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic resources`);
}
