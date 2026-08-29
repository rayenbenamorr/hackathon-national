# EVENTS — Autonomous Mobility & Logistics Grid

Contracts live in `packages/contracts/src/events/mobility-logistics.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `transport.mobility-demand.updated.v1`

Demand and congestion on a corridor.

| Field | Type |
| --- | --- |
| `corridorId` | `string` |
| `governorate` | `gov` |
| `demandIndex` | `unit` |
| `congestionIndex` | `unit` |
| `mode` | `string` |
| `observedAt` | `date` |

Consumed by: `national-digital-twin`, `social-mobility`, `education`, `talent`, `religious-heritage`, `infrastructure`, `land`, `environment`, `tourism`, `life-care`, `culture`

### `transport.resource.dispatched.v1`

A resource was assigned to a request from another ministry.

| Field | Type |
| --- | --- |
| `dispatchId` | `string` |
| `resourceId` | `string` |
| `resourceType` | `string` |
| `requestedBy` | `string` |
| `destination` | `geo` |
| `etaMinutes` | `int` |
| `dispatchedAt` | `date` |

Consumed by: `resilience`, `health`, `digital-nervous-system`

### `transport.congestion.detected.v1`

Congestion crossed a threshold on a corridor.

| Field | Type |
| --- | --- |
| `corridorId` | `string` |
| `governorate` | `gov` |
| `congestionIndex` | `unit` |
| `cause` | `string` |
| `detectedAt` | `date` |

Consumed by: `justice`, `safety-emergency`, `smart-trade`, `infrastructure`, `environment`, `tourism`

### `logistics.freight.updated.v1`

A freight movement changed state.

| Field | Type |
| --- | --- |
| `orderId` | `string` |
| `originGovernorate` | `gov` |
| `destinationGovernorate` | `gov` |
| `tonnes` | `number` |
| `status` | `enum:planned|loading|moving|delivered|blocked` |
| `updatedAt` | `date` |

Consumed by: `industrial-energy`, `smart-trade`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `emergency.incident.created.v1` | safety-emergency | critical | An incident closes lanes and pulls resources; both are mobility facts. |
| `emergency.resource.requested.v1` | safety-emergency | critical | Emergency resource requests are dispatch orders for Transport. |
| `health.emergency.declared.v1` | health | critical | A health emergency is a transport mission with a clock. |
| `health.capacity.updated.v1` | health | critical | A resource is only correctly routed if the destination can receive it. |
| `resilience.resource-request.created.v1` | resilience | critical | Relief convoys are planned from crisis resource requests. |
| `resilience.crisis.declared.v1` | resilience | critical | Crisis mode reprioritises the entire fleet. |
| `environment.air-quality.updated.v1` | environment | normal | Traffic is both a cause and a victim of poor air; both feed the corridor twin. |
| `environment.climate-risk.updated.v1` | environment | normal | Flood and heat risk close corridors before any incident is reported. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Traffic flow and GPS observations are the mobility twin. |
| `infrastructure.failure.predicted.v1` | infrastructure | critical | A predicted bridge failure removes a corridor from every route. |
| `infrastructure.maintenance.scheduled.v1` | infrastructure | critical | Planned works are planned congestion. |
| `trade.shipment.updated.v1` | smart-trade | critical | Freight planning starts from the shipments that exist. |
| `culture.event.scheduled.v1` | culture | normal | A scheduled gathering is a demand spike with a known location and hour. |
| `tourism.visitor-flow.updated.v1` | tourism | normal | Seasonal visitor flows reshape corridor demand. |
| `education.school-condition.updated.v1` | education | normal | School location and status drive school transport planning. |
| `agriculture.yield.forecast.v1` | food-water | normal | Harvest volumes are freight demand with a season. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
