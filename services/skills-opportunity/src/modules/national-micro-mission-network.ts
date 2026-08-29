/**
 * National Micro-Mission Network — National Skills & Opportunity OS
 *
 * Short, real assignments published against detected gaps.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { seededRandom } from '@platform/geo';
import { nowIso, type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Skill } from '../domain.ts';
import { makeSkill, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'national-micro-mission-network',
  name: 'National Micro-Mission Network',
  purpose: 'Short, real assignments published against detected gaps.',
} as const;

/** Create a skill. Any field you omit is filled with a plausible synthetic value. */
export async function createSkill(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Skill>(COLLECTION);
  const rng = seededRandom(`skills-opportunity:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeSkill(rng, rows.count()), ...(req.body as Partial<Skill>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish(
    'skills.micro-mission.published.v1',
    {
      missionId: created.id,
      title: created.label,
      skill: created.label,
      governorate: created.governorate,
      durationDays: 1,
      requestedBy: ctx.id,
      publishedAt: nowIso(),
    },
    { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
  );

  return { data: created, synthetic: true };
}
