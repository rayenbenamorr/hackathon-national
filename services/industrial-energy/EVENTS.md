# EVENTS — Industrial & Energy Intelligence Grid

Contracts live in `packages/contracts/src/events/industrial-energy.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `energy.grid-load.updated.v1`

Load, generation and renewable share at a grid node.

| Field | Type |
| --- | --- |
| `nodeId` | `string` |
| `governorate` | `gov` |
| `loadMw` | `number` |
| `generationMw` | `number` |
| `renewableShare` | `unit` |
| `observedAt` | `date` |

Consumed by: `national-digital-twin`, `talent`, `religious-heritage`, `digital-nervous-system`, `infrastructure`, `environment`

### `energy.outage-risk.flagged.v1`

A node is at risk of failing to serve its load.

| Field | Type |
| --- | --- |
| `nodeId` | `string` |
| `governorate` | `gov` |
| `riskScore` | `unit` |
| `expectedShortfallMw` | `number` |
| `horizonHours` | `int` |
| `flaggedAt` | `date` |

Consumed by: `resilience`, `treasury`, `social-mobility`, `food-water`, `health`

### `industry.production.updated.v1`

Production changed at an industrial asset.

| Field | Type |
| --- | --- |
| `assetId` | `string` |
| `sector` | `string` |
| `governorate` | `gov` |
| `outputTonnesDay` | `number` |
| `energyLoadMw` | `number` |
| `updatedAt` | `date` |

Consumed by: `safety-emergency`, `global-tunisia`, `smart-trade`, `skills-opportunity`, `education`, `land`, `environment`

### `industry.symbiosis.matched.v1`

One plant waste stream was matched to another plant input.

| Field | Type |
| --- | --- |
| `matchId` | `string` |
| `sourceAssetId` | `string` |
| `targetAssetId` | `string` |
| `stream` | `string` |
| `tonnesPerYear` | `number` |
| `governorate` | `gov` |
| `matchedAt` | `date` |

Consumed by: `research`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `environment.air-quality.updated.v1` | environment | critical | Emissions constrain production; the plant twin must see its own consequence. |
| `environment.waste-stream.updated.v1` | environment | critical | Waste streams are the raw material of the symbiosis engine. |
| `environment.climate-risk.updated.v1` | environment | normal | Heat risk changes both demand and generation capacity. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Energy load and vibration observations are the grid and asset twins. |
| `agriculture.water-demand.predicted.v1` | food-water | critical | Industry and agriculture compete for the same water and the same pumping energy. |
| `infrastructure.failure.predicted.v1` | infrastructure | critical | A predicted power-line failure is an outage risk before it is a maintenance order. |
| `logistics.freight.updated.v1` | mobility-logistics | normal | Freight movement is the physical trace of industrial output. |
| `trade.supply-risk.flagged.v1` | smart-trade | critical | An input dependency at risk stops a production line. |
| `treasury.funding.approved.v1` | treasury | normal | Industrial and renewable programmes move with approved funding. |
| `resilience.crisis.declared.v1` | resilience | critical | Crisis load-shedding priorities are set from the declaration. |
| `research.finding.released.v1` | research | normal | Process and materials results are adopted first by industry. |
| `skills.gap.detected.v1` | skills-opportunity | normal | Operator and maintenance shortages cap what the grid can safely run. |
| `land.site-suitability.scored.v1` | land | normal | Renewable siting is a land question before it is an energy question. |
| `twin.scenario.completed.v1` | national-digital-twin | normal | Scenario outcomes set the demand assumptions the grid plans against. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
