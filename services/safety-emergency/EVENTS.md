# EVENTS — National Safety & Emergency Grid

Contracts live in `packages/contracts/src/events/safety-emergency.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `emergency.incident.created.v1`

An incident was reported. The most widely consumed event on the platform.

| Field | Type |
| --- | --- |
| `incidentId` | `string` |
| `incidentType` | `string` |
| `severity` | `string` |
| `location` | `geo` |
| `governorate` | `gov` |
| `casualties` | `int` |
| `declaredAt` | `date` |

Consumed by: `justice`, `resilience`, `national-digital-twin`, `social-mobility`, `health`, `talent`, `religious-heritage`, `digital-nervous-system`, `mobility-logistics`, `infrastructure`, `land`, `environment`, `tourism`, `life-care`, `culture`

### `emergency.incident.resolved.v1`

An incident is closed, with how long it took.

| Field | Type |
| --- | --- |
| `incidentId` | `string` |
| `incidentType` | `string` |
| `governorate` | `gov` |
| `durationMinutes` | `int` |
| `resolvedAt` | `date` |

Consumed by: `treasury`

### `emergency.resource.requested.v1`

Emergency asks another ministry for a specific resource.

| Field | Type |
| --- | --- |
| `requestId` | `string` |
| `incidentId` | `string` |
| `resourceType` | `string` |
| `location` | `geo` |
| `urgency` | `enum:normal|high|critical` |
| `requestedAt` | `date` |

Consumed by: `mobility-logistics`

### `emergency.road-risk.updated.v1`

Risk score for a road segment changed.

| Field | Type |
| --- | --- |
| `segmentId` | `string` |
| `governorate` | `gov` |
| `riskScore` | `unit` |
| `drivers` | `string[]` |
| `observedAt` | `date` |

Consumed by: _nobody yet_


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `health.capacity.updated.v1` | health | critical | Dispatch sends casualties to the nearest facility that can actually receive them. |
| `health.emergency.declared.v1` | health | critical | A health emergency needs civil protection resources Health does not own. |
| `transport.congestion.detected.v1` | mobility-logistics | critical | Congestion changes response time more than distance does. |
| `environment.air-quality.updated.v1` | environment | normal | Air quality drives both road risk and the protection level responders need. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Traffic, rainfall and vibration observations feed continuous road-risk scoring. |
| `infrastructure.failure.predicted.v1` | infrastructure | critical | A failing bridge is a road-risk input and a route exclusion at the same time. |
| `water.reservoir-level.updated.v1` | food-water | normal | Reservoir state is a flood precursor for downstream zones. |
| `industry.production.updated.v1` | industrial-energy | normal | Industrial activity localises the risk of industrial incidents. |
| `resilience.crisis.declared.v1` | resilience | critical | Under a declared crisis the grid switches to crisis dispatch rules. |
| `culture.event.scheduled.v1` | culture | normal | A scheduled gathering changes both crowd risk and the resources to pre-position. |
| `tourism.visitor-flow.updated.v1` | tourism | normal | Visitor volume changes how many people are in a zone at a given hour. |
| `talent.facility-usage.updated.v1` | talent | normal | Stadium and gymnasium usage is crowd exposure. |
| `education.school-condition.updated.v1` | education | normal | School condition and occupancy shape the response to a building incident. |
| `social.vulnerability.updated.v1` | social-mobility | normal | Vulnerable cohorts need a different response, not the same one faster. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
