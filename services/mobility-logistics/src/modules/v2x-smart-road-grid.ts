/**
 * V2X Smart Road Grid
 * Road-side signals and vehicle-to-infrastructure messages.
 *
 * This module has no endpoint of its own yet — it is where its logic belongs.
 * Ask Claude Code: "add a feature to the V2X Smart Road Grid module of Autonomous Mobility & Logistics Grid".
 */
import type { ServiceContext } from '@platform/service-kit';

export const MODULE = {
  id: 'v2x-smart-road-grid',
  name: 'V2X Smart Road Grid',
  purpose: 'Road-side signals and vehicle-to-infrastructure messages.',
} as const;

/** Summary of what this module can currently see. Used by GET /health. */
export function moduleStatus(ctx: ServiceContext) {
  return { module: MODULE.id, records: ctx.db.collection('resources').count(), twins: ctx.twins.count() };
}
