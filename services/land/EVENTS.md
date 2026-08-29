# EVENTS — National Land Intelligence System

Contracts live in `packages/contracts/src/events/land.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `land.parcel.updated.v1`

A parcel record changed.

| Field | Type |
| --- | --- |
| `parcelId` | `string` |
| `governorate` | `gov` |
| `zoning` | `string` |
| `areaHectares` | `number` |
| `ownership` | `string` |
| `updatedAt` | `date` |

Consumed by: `justice`, `food-water`, `digital-nervous-system`

### `land.zoning.changed.v1`

Zoning changed — several ministries must re-plan.

| Field | Type |
| --- | --- |
| `parcelId` | `string` |
| `governorate` | `gov` |
| `previousZoning` | `string` |
| `newZoning` | `string` |
| `reason` | `text` |
| `changedAt` | `date` |

Consumed by: `justice`, `national-digital-twin`, `smart-trade`, `food-water`, `religious-heritage`, `infrastructure`, `environment`

### `land.site-suitability.scored.v1`

A site was scored for a proposed use.

| Field | Type |
| --- | --- |
| `evaluationId` | `string` |
| `parcelId` | `string` |
| `proposedUse` | `string` |
| `governorate` | `gov` |
| `score` | `unit` |
| `constraints` | `string[]` |
| `scoredAt` | `date` |

Consumed by: `resilience`, `global-tunisia`, `treasury`, `industrial-energy`, `research`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `environment.climate-risk.updated.v1` | environment | critical | Flood and drought risk are hard constraints on any siting score. |
| `environment.air-quality.updated.v1` | environment | normal | Air quality is a constraint on residential and school siting. |
| `agriculture.water-demand.predicted.v1` | food-water | critical | Water availability decides whether agricultural zoning is viable. |
| `agriculture.water-shortage.predicted.v1` | food-water | critical | A shortage forecast should freeze water-intensive siting decisions. |
| `infrastructure.asset-health.updated.v1` | infrastructure | critical | A site is only suitable if the networks reaching it are. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | critical | Accessibility is one of the strongest terms in a suitability score. |
| `industry.production.updated.v1` | industrial-energy | normal | Industrial activity defines the real use of industrial zoning. |
| `emergency.incident.created.v1` | safety-emergency | normal | Repeated incidents on a parcel are a siting constraint. |
| `resilience.crisis.declared.v1` | resilience | normal | Crisis staging areas are drawn from the public asset register. |
| `treasury.budget-line.updated.v1` | treasury | normal | Public asset valuation and the budget move together. |
| `tourism.site-pressure.detected.v1` | tourism | normal | Touristic zoning pressure is measured, not assumed. |
| `culture.asset-condition.updated.v1` | culture | normal | Protected cultural assets constrain neighbouring parcels. |
| `education.school-condition.updated.v1` | education | normal | School siting is a land decision with a 40-year horizon. |
| `twin.scenario.completed.v1` | national-digital-twin | normal | Scenario outcomes are usually expressed as land decisions. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
