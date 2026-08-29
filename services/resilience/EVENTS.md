# EVENTS — National Resilience Command System

Contracts live in `packages/contracts/src/events/resilience.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `resilience.crisis.declared.v1`

A crisis is declared — the single signal that reconfigures the whole platform.

| Field | Type |
| --- | --- |
| `crisisId` | `string` |
| `kind` | `string` |
| `severity` | `string` |
| `governorate` | `gov` |
| `location` | `geo` |
| `affectedPeople` | `int` |
| `declaredAt` | `date` |

Consumed by: `justice`, `safety-emergency`, `global-tunisia`, `national-digital-twin`, `social-mobility`, `industrial-energy`, `smart-trade`, `food-water`, `health`, `education`, `religious-heritage`, `digital-nervous-system`, `mobility-logistics`, `infrastructure`, `land`, `environment`, `tourism`, `life-care`

### `resilience.relief-plan.updated.v1`

The resourced relief plan for a crisis changed.

| Field | Type |
| --- | --- |
| `crisisId` | `string` |
| `governorate` | `gov` |
| `requiredResources` | `string[]` |
| `coveragePct` | `unit` |
| `updatedAt` | `date` |

Consumed by: `treasury`

### `resilience.resource-request.created.v1`

Resilience needs a resource another ministry controls.

| Field | Type |
| --- | --- |
| `requestId` | `string` |
| `crisisId` | `string` |
| `resourceType` | `string` |
| `quantity` | `int` |
| `governorate` | `gov` |
| `urgency` | `enum:normal|high|critical` |

Consumed by: `treasury`, `mobility-logistics`

### `resilience.mesh-node.status.v1`

Emergency mesh node reachability.

| Field | Type |
| --- | --- |
| `nodeId` | `string` |
| `governorate` | `gov` |
| `reachable` | `bool` |
| `batteryPct` | `unit` |
| `neighbours` | `int` |
| `observedAt` | `date` |

Consumed by: `digital-nervous-system`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `emergency.incident.created.v1` | safety-emergency | critical | Clustered incidents are how a crisis is first detected, before anyone declares one. |
| `environment.climate-risk.updated.v1` | environment | critical | Drought, heat and flood risk are the leading indicators the command system watches. |
| `agriculture.water-shortage.predicted.v1` | food-water | critical | A predicted water shortage is a slow-onset crisis; declaring early is the whole point. |
| `health.capacity.updated.v1` | health | critical | A relief plan that ignores hospital saturation sends people where they cannot be treated. |
| `infrastructure.failure.predicted.v1` | infrastructure | critical | A predicted bridge or network failure changes every evacuation route. |
| `energy.outage-risk.flagged.v1` | industrial-energy | normal | Power shortfall determines which shelters and hospitals need generators. |
| `transport.resource.dispatched.v1` | mobility-logistics | critical | The relief plan tracks coverage only if it sees what was actually dispatched. |
| `social.vulnerability.updated.v1` | social-mobility | critical | Evacuation and aid priority follow vulnerability, not geography alone. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Water level, rainfall and wind observations drive early crisis detection. |
| `treasury.funding.approved.v1` | treasury | normal | A relief plan is only real once its funding is approved. |
| `land.site-suitability.scored.v1` | land | normal | Shelter and staging sites come from land suitability, scored in advance. |
| `education.school-condition.updated.v1` | education | normal | Schools are the default shelter network; their condition decides which can be used. |
| `tourism.site-pressure.detected.v1` | tourism | normal | Visitor concentration changes the population actually present in a zone. |
| `twin.anomaly.detected.v1` | national-digital-twin | normal | Multi-sector anomalies are early crisis signatures. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
