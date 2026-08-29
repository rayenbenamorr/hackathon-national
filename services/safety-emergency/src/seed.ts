/**
 * SYNTHETIC DATA — National Safety & Emergency Grid
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom, syntheticPointIn } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Incident } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /incidents. */
export function makeIncident(rng: () => number, index: number): Omit<Incident, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Incident ${index + 1} — ${gov.name}`,
    incidentType: pick(
      [
        'road-accident',
        'fire',
        'flood',
        'medical',
        'industrial',
        'power-outage',
        'water-outage',
        'security',
        'environmental',
      ] as const,
      rng,
    ),
    severity: pick(['minor', 'moderate', 'major', 'critical'] as const, rng),
    status: pick(['open', 'dispatched', 'contained', 'resolved'] as const, rng),
    location: syntheticPointIn(gov.code, rng),
    governorate: gov.code,
    declaredAt: new Date(Date.now() - Math.round(rng() * 90) * 86400000).toISOString(),
    casualties: Math.round(rng() * 100),
    synthetic: true,
  };
}

export function twinIdFor(row: Incident): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Incident): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'process',
    label: row.label,
    location: row.location,
    state: {
      status: row.status,
      severity: row.severity,
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('safety-emergency:incidents:v1');
  const rows = ctx.db
    .collection<Incident>(COLLECTION)
    .insertMany(Array.from({ length: 30 }, (_, index) => makeIncident(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic incidents`);
}
