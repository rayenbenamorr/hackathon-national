/**
 * EVENT CONTRACTS — Smart Trade Network
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
 * A product passport was issued — origin, footprint, certification.
 *
 * Owner: `smart-trade` (Smart Trade Network) — no other service may publish this.
 */
export const TradeProductPassportIssuedV1 = defineEvent({
  type: 'trade.product-passport.issued.v1',
  owner: 'smart-trade',
  summary: 'A product passport was issued — origin, footprint, certification.',
  tags: ['smart-trade'],
  payload: z.object({
    passportId: z.string(),
    productId: z.string(),
    category: z.string(),
    originGovernorate: z.string(),
    carbonKgPerTonne: z.number(),
    issuedAt: z.string(),
  }),
  example: {
    passportId: 'passport_0001',
    productId: 'product_0001',
    category: 'category-sample',
    originGovernorate: 'TN-11',
    carbonKgPerTonne: 42.5,
    issuedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A shipment changed state.
 *
 * Owner: `smart-trade` (Smart Trade Network) — no other service may publish this.
 */
export const TradeShipmentUpdatedV1 = defineEvent({
  type: 'trade.shipment.updated.v1',
  owner: 'smart-trade',
  summary: 'A shipment changed state.',
  tags: ['smart-trade'],
  payload: z.object({
    shipmentId: z.string(),
    productId: z.string(),
    originGovernorate: z.string(),
    destinationCountry: z.string(),
    tonnes: z.number(),
    status: z.enum(['booked', 'in-transit', 'customs', 'delivered', 'blocked']),
    updatedAt: z.string(),
  }),
  example: {
    shipmentId: 'shipment_0001',
    productId: 'product_0001',
    originGovernorate: 'TN-11',
    destinationCountry: 'destinationCountry-sample',
    tonnes: 42.5,
    status: 'booked',
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A market opening was detected for a product.
 *
 * Owner: `smart-trade` (Smart Trade Network) — no other service may publish this.
 */
export const TradeExportOpportunityDetectedV1 = defineEvent({
  type: 'trade.export-opportunity.detected.v1',
  owner: 'smart-trade',
  summary: 'A market opening was detected for a product.',
  tags: ['smart-trade'],
  payload: z.object({
    opportunityId: z.string(),
    productId: z.string(),
    market: z.string(),
    estimatedValueTnd: z.number(),
    requirements: z.array(z.string()),
    detectedAt: z.string(),
  }),
  example: {
    opportunityId: 'opportunity_0001',
    productId: 'product_0001',
    market: 'market-sample',
    estimatedValueTnd: 42.5,
    requirements: ['sanitary-certificate', 'origin-proof'],
    detectedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A dependency in the supply graph is at risk.
 *
 * Owner: `smart-trade` (Smart Trade Network) — no other service may publish this.
 */
export const TradeSupplyRiskFlaggedV1 = defineEvent({
  type: 'trade.supply-risk.flagged.v1',
  owner: 'smart-trade',
  summary: 'A dependency in the supply graph is at risk.',
  tags: ['smart-trade'],
  payload: z.object({
    riskId: z.string(),
    productId: z.string(),
    dependency: z.string(),
    cause: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    governorate: z.string(),
    flaggedAt: z.string(),
  }),
  example: {
    riskId: 'risk_0001',
    productId: 'product_0001',
    dependency: 'dependency-sample',
    cause: 'cause-sample',
    severity: 'low',
    governorate: 'TN-11',
    flaggedAt: '2026-08-28T09:00:00.000Z',
  },
});
