/**
 * SYNTHETIC DATA — National Skills & Opportunity OS
 *
 * §25: no real citizen data, ever. Every row carries `synthetic: true`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Skill } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST /skills. */
export function makeSkill(rng: () => number, index: number): Omit<Skill, 'id'> {
  const gov = pickGovernorate(rng);
  return {
    label: `Skill ${index + 1} — ${gov.name}`,
    domain: pick(
      [
        'water',
        'energy',
        'health',
        'digital',
        'logistics',
        'agriculture',
        'construction',
        'tourism',
        'education',
        'finance',
      ] as const,
      rng,
    ),
    governorate: gov.code,
    supplyIndex: Number(rng().toFixed(3)),
    demandIndex: Number(rng().toFixed(3)),
    gap: Number((rng() * 100).toFixed(2)),
    trainingMonths: Math.max(1, Math.round(rng() * 30)),
    adjacentSkills: pickMany(
      ['data-analysis', 'maintenance', 'project-management', 'quality-control'] as const,
      rng,
      2,
    ),
    synthetic: true,
  };
}

export function twinIdFor(row: Skill): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Skill): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'process',
    label: row.label,
    state: {
      gap: row.gap,
      demandIndex: row.demandIndex,
      status: 'nominal',
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('skills-opportunity:skills:v1');
  const rows = ctx.db
    .collection<Skill>(COLLECTION)
    .insertMany(Array.from({ length: 40 }, (_, index) => makeSkill(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(`seeded ${rows.length} synthetic skills`);
}
