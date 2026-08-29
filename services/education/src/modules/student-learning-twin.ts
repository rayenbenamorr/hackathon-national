/**
 * Student Learning Twin
 * Cohort-level mastery and progression, never a named pupil.
 *
 * This module has no endpoint of its own yet — it is where its logic belongs.
 * Ask Claude Code: "add a feature to the Student Learning Twin module of Adaptive Education OS".
 */
import type { ServiceContext } from '@platform/service-kit';

export const MODULE = {
  id: 'student-learning-twin',
  name: 'Student Learning Twin',
  purpose: 'Cohort-level mastery and progression, never a named pupil.',
} as const;

/** Summary of what this module can currently see. Used by GET /health. */
export function moduleStatus(ctx: ServiceContext) {
  return { module: MODULE.id, records: ctx.db.collection('schools').count(), twins: ctx.twins.count() };
}
