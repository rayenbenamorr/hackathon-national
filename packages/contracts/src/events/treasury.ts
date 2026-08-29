/**
 * EVENT CONTRACTS — Intelligent Treasury OS
 *
 * Adding an event: declare it here with defineEvent(), then add it to
 * tools/spec/services.part*.mjs and run `pnpm generate` so the manifest,
 * the docs and the architecture registry agree with the code.
 *
 * Changing an event: adding an OPTIONAL field is safe. Anything else needs a
 * new version (`.v2`) with the `.v1` contract kept until every consumer moved.
 */
import { z } from 'zod';
import { defineEvent } from '../registry.ts';

/**
 * A budget line moved.
 *
 * Owner: `treasury` (Intelligent Treasury OS) — no other service may publish this.
 */
export const TreasuryBudgetLineUpdatedV1 = defineEvent({
  type: 'treasury.budget-line.updated.v1',
  owner: 'treasury',
  summary: 'A budget line moved.',
  tags: ['treasury'],
  payload: z.object({
    lineId: z.string(),
    programme: z.string(),
    ministry: z.string(),
    allocatedTnd: z.number(),
    committedTnd: z.number(),
    governorate: z.string(),
    updatedAt: z.string(),
  }),
  example: {
    lineId: 'line_0001',
    programme: 'programme-sample',
    ministry: 'ministry-sample',
    allocatedTnd: 42.5,
    committedTnd: 42.5,
    governorate: 'TN-11',
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Funding was approved for another ministry request.
 *
 * Owner: `treasury` (Intelligent Treasury OS) — no other service may publish this.
 */
export const TreasuryFundingApprovedV1 = defineEvent({
  type: 'treasury.funding.approved.v1',
  owner: 'treasury',
  summary: 'Funding was approved for another ministry request.',
  tags: ['treasury'],
  payload: z.object({
    approvalId: z.string(),
    requestedBy: z.string(),
    amountTnd: z.number(),
    purpose: z.string(),
    governorate: z.string(),
    approvedAt: z.string(),
  }),
  example: {
    approvalId: 'approval_0001',
    requestedBy: 'requestedBy-sample',
    amountTnd: 42.5,
    purpose: 'Synthetic example value for purpose.',
    governorate: 'TN-11',
    approvedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Targeted aid reached a beneficiary cohort.
 *
 * Owner: `treasury` (Intelligent Treasury OS) — no other service may publish this.
 */
export const TreasuryAidDisbursedV1 = defineEvent({
  type: 'treasury.aid.disbursed.v1',
  owner: 'treasury',
  summary: 'Targeted aid reached a beneficiary cohort.',
  tags: ['treasury'],
  payload: z.object({
    disbursementId: z.string(),
    cohortId: z.string(),
    amountTnd: z.number(),
    governorate: z.string(),
    beneficiaries: z.number().int(),
    disbursedAt: z.string(),
  }),
  example: {
    disbursementId: 'disbursement_0001',
    cohortId: 'cohort_0001',
    amountTnd: 42.5,
    governorate: 'TN-11',
    beneficiaries: 12,
    disbursedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A fiscal risk was detected — over-commitment, shock exposure, revenue gap.
 *
 * Owner: `treasury` (Intelligent Treasury OS) — no other service may publish this.
 */
export const TreasuryFiscalRiskFlaggedV1 = defineEvent({
  type: 'treasury.fiscal-risk.flagged.v1',
  owner: 'treasury',
  summary: 'A fiscal risk was detected — over-commitment, shock exposure, revenue gap.',
  tags: ['treasury'],
  payload: z.object({
    riskId: z.string(),
    driver: z.string(),
    exposureTnd: z.number(),
    governorate: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    flaggedAt: z.string(),
  }),
  example: {
    riskId: 'risk_0001',
    driver: 'driver-sample',
    exposureTnd: 42.5,
    governorate: 'TN-11',
    severity: 'low',
    flaggedAt: '2026-08-28T09:00:00.000Z',
  },
});
