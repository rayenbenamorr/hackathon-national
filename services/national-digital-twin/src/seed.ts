/**
 * SYNTHETIC DATA — Tunisia National Digital Twin
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type RegionState } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /regionStates. */
export function makeRegionState(rng: () => number, index: number): Omit<RegionState, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Region state ${index + 1} — ${gov.name}`,
    governorate: gov.code,
    population: Math.round(rng() * 800) + 20,
    stressIndex: Number(rng().toFixed(3)),
    waterStress: Number(rng().toFixed(3)),
    airQualityIndex: Number((rng() * 100).toFixed(2)),
    healthLoad: Number(rng().toFixed(3)),
    mobilityPressure: Number(rng().toFixed(3)),
    economicActivity: Number(rng().toFixed(3)),
    updatedAt: new Date(Date.now() - Math.round(rng() * 90) * 86400000).toISOString(),
    synthetic: true,
  };
}

export function twinIdFor(row: RegionState): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: RegionState): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'region',
    label: row.label,
    state: {
      stressIndex: row.stressIndex,
      waterStress: row.waterStress,
      healthLoad: row.healthLoad,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('national-digital-twin:regionStates:v1');
  const rows = ctx.db
    .collection<RegionState>(COLLECTION)
    .insertMany(Array.from({ length: 24 }, (_, index) => makeRegionState(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic regionStates`);
}
