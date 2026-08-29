/**
 * DOMAIN MODEL — Smart Trade Network
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';

export const COLLECTION = 'products';
export const ENTITY_LABEL = 'Product';

export const Product = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum([
    'olive-oil',
    'dates',
    'textile',
    'phosphate',
    'seafood',
    'electronics',
    'automotive-parts',
    'handicraft',
    'pharma',
  ]),
  hsCode: z.string(),
  originGovernorate: z.string(),
  annualTonnes: z.number(),
  exportShare: z.number().min(0).max(1),
  carbonKgPerTonne: z.number(),
  certified: z.boolean(),
  synthetic: z.boolean().default(true),
});
export type Product = z.infer<typeof Product>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const ProductInput = Product.omit({ id: true, synthetic: true }).partial();
export type ProductInput = z.infer<typeof ProductInput>;

export const MODULES = [
  {
    id: 'smart-product-passport',
    name: 'Smart Product Passport',
    purpose: 'Origin, footprint and certification as a portable record.',
  },
  {
    id: 'ai-export-copilot',
    name: 'AI Export Copilot',
    purpose: 'What a producer must do to reach a target market.',
  },
  {
    id: 'national-supply-graph',
    name: 'National Supply Graph',
    purpose: 'Dependencies between products, inputs and corridors.',
  },
] as const;

export const PUBLISHES = [
  'trade.product-passport.issued.v1',
  'trade.shipment.updated.v1',
  'trade.export-opportunity.detected.v1',
  'trade.supply-risk.flagged.v1',
] as const;

export const CONSUMES = [
  'agriculture.yield.forecast.v1',
  'fisheries.stock.updated.v1',
  'industry.production.updated.v1',
  'logistics.freight.updated.v1',
  'transport.congestion.detected.v1',
  'environment.air-quality.updated.v1',
  'infrastructure.asset-health.updated.v1',
  'treasury.fiscal-risk.flagged.v1',
  'global.diaspora-signal.updated.v1',
  'justice.legal-text.published.v1',
  'research.finding.released.v1',
  'resilience.crisis.declared.v1',
  'land.zoning.changed.v1',
  'skills.gap.detected.v1',
  'iot.sensor.observation.v1',
  'health.epidemic-signal.detected.v1',
] as const;
