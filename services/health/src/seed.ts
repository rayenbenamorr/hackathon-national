/**
 * SYNTHETIC DATA — Connected Health Intelligence System
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Facility } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /facilities. */
export function makeFacility(rng: () => number, index: number): Omit<Facility, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Health facility ${index + 1} — ${gov.name}`,
    facilityType: pick(
      ['regional-hospital', 'university-hospital', 'health-centre', 'clinic', 'dispensary'] as const,
      rng,
    ),
    governorate: gov.code,
    location: syntheticPointIn(gov.code, rng),
    totalBeds: Math.round(rng() * 800) + 20,
    availableBeds: Math.round(rng() * 800) + 20,
    icuAvailable: Math.round(rng() * 100),
    emergencyLoad: Number(rng().toFixed(3)),
    specialties: pickMany(
      ['cardiology', 'paediatrics', 'orthopaedics', 'maternity', 'emergency'] as const,
      rng,
      2,
    ),
    synthetic: true,
  };
}

export function twinIdFor(row: Facility): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Facility): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'hospital',
    label: row.label,
    location: row.location,
    state: {
      availableBeds: row.availableBeds,
      emergencyLoad: row.emergencyLoad,
      icuAvailable: row.icuAvailable,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('health:facilities:v1');
  const rows = ctx.db
    .collection<Facility>(COLLECTION)
    .insertMany(Array.from({ length: 34 }, (_, index) => makeFacility(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic facilities`);
}
