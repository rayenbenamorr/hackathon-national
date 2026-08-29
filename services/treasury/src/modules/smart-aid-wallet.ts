/**
 * Smart Aid Wallet
 * Targeted, traceable aid disbursement.
 *
 * This module has no endpoint of its own yet — it is where its logic belongs.
 * Ask Claude Code: "add a feature to the Smart Aid Wallet module of Intelligent Treasury OS".
 */
import type { ServiceContext } from '@platform/service-kit';

export const MODULE = {
  id: 'smart-aid-wallet',
  name: 'Smart Aid Wallet',
  purpose: 'Targeted, traceable aid disbursement.',
} as const;

/** Summary of what this module can currently see. Used by GET /health. */
export function moduleStatus(ctx: ServiceContext) {
  return { module: MODULE.id, records: ctx.db.collection('budgetLines').count(), twins: ctx.twins.count() };
}
