# EVENTS — Tunisia National Digital Twin

Contracts live in `packages/contracts/src/events/national-digital-twin.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `twin.state.updated.v1`

The national twin recomputed a region state.

| Field | Type |
| --- | --- |
| `governorate` | `gov` |
| `stressIndex` | `unit` |
| `drivers` | `string[]` |
| `contributingServices` | `string[]` |
| `updatedAt` | `date` |

Consumed by: `global-tunisia`, `food-water`, `religious-heritage`

### `twin.scenario.completed.v1`

A cross-sector scenario finished running.

| Field | Type |
| --- | --- |
| `scenarioId` | `string` |
| `question` | `text` |
| `governorate` | `gov` |
| `outcome` | `text` |
| `impactedSectors` | `string[]` |
| `confidence` | `unit` |
| `completedAt` | `date` |

Consumed by: `treasury`, `industrial-energy`, `research`, `land`

### `twin.anomaly.detected.v1`

A region deviates from its own baseline across several sectors at once.

| Field | Type |
| --- | --- |
| `anomalyId` | `string` |
| `governorate` | `gov` |
| `metric` | `string` |
| `deviation` | `number` |
| `likelyCauses` | `string[]` |
| `detectedAt` | `date` |

Consumed by: `justice`, `resilience`, `digital-nervous-system`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `environment.air-quality.updated.v1` | environment | critical | Air quality is one of the six axes of the regional state vector. |
| `environment.climate-risk.updated.v1` | environment | critical | Climate risk is the slow variable every scenario is run against. |
| `agriculture.water-demand.predicted.v1` | food-water | critical | Water demand versus supply is the axis that moves every other one. |
| `agriculture.water-shortage.predicted.v1` | food-water | critical | A shortage prediction propagates into health, economy and mobility in the model. |
| `health.capacity.updated.v1` | health | critical | Health load is a direct component of the regional stress index. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | critical | Mobility pressure is a component of the regional stress index. |
| `energy.grid-load.updated.v1` | industrial-energy | critical | Energy load is a component of regional economic activity. |
| `infrastructure.asset-health.updated.v1` | infrastructure | critical | Asset health bounds what any scenario can assume about capacity. |
| `social.vulnerability.updated.v1` | social-mobility | critical | Vulnerability is what makes the same shock a different event in two governorates. |
| `emergency.incident.created.v1` | safety-emergency | normal | Incident density is a fast indicator against a slow model. |
| `resilience.crisis.declared.v1` | resilience | critical | A declared crisis switches the twin into crisis mode for that zone. |
| `education.school-condition.updated.v1` | education | normal | School condition is a durable component of regional capability. |
| `land.zoning.changed.v1` | land | normal | Zoning is the lever most scenarios end up recommending. |
| `tourism.visitor-flow.updated.v1` | tourism | normal | Seasonal population is not resident population; the model needs both. |
| `treasury.fiscal-risk.flagged.v1` | treasury | normal | A fiscal constraint bounds which scenario outcomes are reachable. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Raw observations keep regional twins current between ministry publications. |
| `trade.shipment.updated.v1` | smart-trade | normal | Trade flows are the economic exchange term between regions. |
| `skills.gap.detected.v1` | skills-opportunity | normal | Skill availability limits what a regional plan can actually execute. |
| `culture.creative-economy.updated.v1` | culture | normal | Creative activity is a measurable part of regional economic activity. |
| `care.facility-capacity.updated.v1` | life-care | normal | Care coverage is part of the social axis of the region state. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
