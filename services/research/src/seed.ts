/**
 * SYNTHETIC DATA — Tunisia Research Brain
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Project } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /projects. */
export function makeProject(rng: () => number, index: number): Omit<Project, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Research project ${index + 1} — ${gov.name}`,
    discipline: pick(
      [
        'water',
        'energy',
        'health',
        'agronomy',
        'materials',
        'computing',
        'climate',
        'social',
        'marine',
      ] as const,
      rng,
    ),
    institution: `${gov.name} institution ${index + 1}`,
    governorate: gov.code,
    status: pick(['proposed', 'running', 'completed', 'transferred'] as const, rng),
    trl: Math.max(1, Math.round(rng() * 9)),
    budgetTnd: Math.round(rng() * 900000),
    keywords: pickMany(['desalination', 'photovoltaic', 'agronomy', 'sensing', 'materials'] as const, rng, 2),
    synthetic: true,
  };
}

export function twinIdFor(row: Project): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Project): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'process',
    label: row.label,
    state: {
      status: row.status,
      trl: row.trl,
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('research:projects:v1');
  const rows = ctx.db
    .collection<Project>(COLLECTION)
    .insertMany(Array.from({ length: 38 }, (_, index) => makeProject(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic projects`);
}
