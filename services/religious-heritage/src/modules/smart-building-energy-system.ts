/**
 * Smart Building / Energy System
 * Consumption and comfort in places of worship.
 *
 * This module has no endpoint of its own yet — it is where its logic belongs.
 * Ask Claude Code: "add a feature to the Smart Building / Energy System module of Smart Religious Heritage Network".
 */
import type { ServiceContext } from '@platform/service-kit';

export const MODULE = {
  id: 'smart-building-energy-system',
  name: 'Smart Building / Energy System',
  purpose: 'Consumption and comfort in places of worship.',
} as const;

/** Summary of what this module can currently see. Used by GET /health. */
export function moduleStatus(ctx: ServiceContext) {
  return { module: MODULE.id, records: ctx.db.collection('sites').count(), twins: ctx.twins.count() };
}
