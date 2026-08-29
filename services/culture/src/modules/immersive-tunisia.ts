/**
 * Immersive Tunisia
 * Digitised works and immersive access.
 *
 * This module has no endpoint of its own yet — it is where its logic belongs.
 * Ask Claude Code: "add a feature to the Immersive Tunisia module of Tunisia Cultural Intelligence Network".
 */
import type { ServiceContext } from '@platform/service-kit';

export const MODULE = {
  id: 'immersive-tunisia',
  name: 'Immersive Tunisia',
  purpose: 'Digitised works and immersive access.',
} as const;

/** Summary of what this module can currently see. Used by GET /health. */
export function moduleStatus(ctx: ServiceContext) {
  return { module: MODULE.id, records: ctx.db.collection('assets').count(), twins: ctx.twins.count() };
}
