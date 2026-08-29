/**
 * AR Tunisia
 * Anchored augmented-reality scenes at real sites.
 *
 * This module has no endpoint of its own yet — it is where its logic belongs.
 * Ask Claude Code: "add a feature to the AR Tunisia module of Tunisia Immersive Tourism OS".
 */
import type { ServiceContext } from '@platform/service-kit';

export const MODULE = {
  id: 'ar-tunisia',
  name: 'AR Tunisia',
  purpose: 'Anchored augmented-reality scenes at real sites.',
} as const;

/** Summary of what this module can currently see. Used by GET /health. */
export function moduleStatus(ctx: ServiceContext) {
  return { module: MODULE.id, records: ctx.db.collection('sites').count(), twins: ctx.twins.count() };
}
