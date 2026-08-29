/**
 * Smart Civil Services
 * Civil requests that do not need an emergency response.
 *
 * This module has no endpoint of its own yet — it is where its logic belongs.
 * Ask Claude Code: "add a feature to the Smart Civil Services module of National Safety & Emergency Grid".
 */
import type { ServiceContext } from '@platform/service-kit';

export const MODULE = {
  id: 'smart-civil-services',
  name: 'Smart Civil Services',
  purpose: 'Civil requests that do not need an emergency response.',
} as const;

/** Summary of what this module can currently see. Used by GET /health. */
export function moduleStatus(ctx: ServiceContext) {
  return { module: MODULE.id, records: ctx.db.collection('incidents').count(), twins: ctx.twins.count() };
}
