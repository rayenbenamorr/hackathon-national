/**
 * Smart Ocean & Fisheries Network
 * Stock and effort per fishing zone.
 *
 * This module has no endpoint of its own yet — it is where its logic belongs.
 * Ask Claude Code: "add a feature to the Smart Ocean & Fisheries Network module of Autonomous Food & Water Grid".
 */
import type { ServiceContext } from '@platform/service-kit';

export const MODULE = {
  id: 'smart-ocean-fisheries-network',
  name: 'Smart Ocean & Fisheries Network',
  purpose: 'Stock and effort per fishing zone.',
} as const;

/** Summary of what this module can currently see. Used by GET /health. */
export function moduleStatus(ctx: ServiceContext) {
  return { module: MODULE.id, records: ctx.db.collection('farms').count(), twins: ctx.twins.count() };
}
