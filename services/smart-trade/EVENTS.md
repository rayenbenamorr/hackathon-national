# EVENTS — Smart Trade Network

Contracts live in `packages/contracts/src/events/smart-trade.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `trade.product-passport.issued.v1`

A product passport was issued — origin, footprint, certification.

| Field | Type |
| --- | --- |
| `passportId` | `string` |
| `productId` | `string` |
| `category` | `string` |
| `originGovernorate` | `gov` |
| `carbonKgPerTonne` | `number` |
| `issuedAt` | `date` |

Consumed by: `environment`

### `trade.shipment.updated.v1`

A shipment changed state.

| Field | Type |
| --- | --- |
| `shipmentId` | `string` |
| `productId` | `string` |
| `originGovernorate` | `gov` |
| `destinationCountry` | `string` |
| `tonnes` | `number` |
| `status` | `enum:booked|in-transit|customs|delivered|blocked` |
| `updatedAt` | `date` |

Consumed by: `national-digital-twin`, `mobility-logistics`

### `trade.export-opportunity.detected.v1`

A market opening was detected for a product.

| Field | Type |
| --- | --- |
| `opportunityId` | `string` |
| `productId` | `string` |
| `market` | `string` |
| `estimatedValueTnd` | `number` |
| `requirements` | `string[]` |
| `detectedAt` | `date` |

Consumed by: `global-tunisia`, `food-water`, `skills-opportunity`

### `trade.supply-risk.flagged.v1`

A dependency in the supply graph is at risk.

| Field | Type |
| --- | --- |
| `riskId` | `string` |
| `productId` | `string` |
| `dependency` | `string` |
| `cause` | `string` |
| `severity` | `enum:low|medium|high` |
| `governorate` | `gov` |
| `flaggedAt` | `date` |

Consumed by: `justice`, `treasury`, `industrial-energy`, `research`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `agriculture.yield.forecast.v1` | food-water | critical | Exportable volume of olive oil, dates and cereals is a yield forecast first. |
| `fisheries.stock.updated.v1` | food-water | normal | Seafood export capacity follows stock and effort. |
| `industry.production.updated.v1` | industrial-energy | critical | The supply graph is built from what plants actually produce. |
| `logistics.freight.updated.v1` | mobility-logistics | critical | A shipment without a freight movement is a plan, not a shipment. |
| `transport.congestion.detected.v1` | mobility-logistics | normal | Corridor congestion is the most common cause of a missed export window. |
| `environment.air-quality.updated.v1` | environment | normal | Carbon and emission context feeds the product passport footprint. |
| `infrastructure.asset-health.updated.v1` | infrastructure | critical | Port and rail health is a hard constraint on export capacity. |
| `treasury.fiscal-risk.flagged.v1` | treasury | normal | Customs revenue exposure and trade risk are read together. |
| `global.diaspora-signal.updated.v1` | global-tunisia | normal | Diaspora demand is a real and under-used export channel. |
| `justice.legal-text.published.v1` | justice | normal | Export requirements change when the applicable text changes. |
| `research.finding.released.v1` | research | normal | Certification and process results unlock markets that were closed. |
| `resilience.crisis.declared.v1` | resilience | normal | A crisis reroutes or blocks corridors and shipments. |
| `land.zoning.changed.v1` | land | normal | Industrial zoning determines where production can expand. |
| `skills.gap.detected.v1` | skills-opportunity | normal | Certification and quality-control skills gate export readiness. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Cold-chain temperature and container GPS observations are the shipment twin. |
| `health.epidemic-signal.detected.v1` | health | normal | Food and pharmaceutical export controls follow health signals at the border. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
