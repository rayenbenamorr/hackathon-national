# EVENTS — Tunisia Digital Nervous System

Contracts live in `packages/contracts/src/events/digital-nervous-system.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `iot.sensor.observation.v1`

One sensor observation. The highest-volume event on the platform; ten ministries consume it.

| Field | Type |
| --- | --- |
| `observationId` | `string` |
| `sensorId` | `string` |
| `sensorKind` | `string` |
| `value` | `number` |
| `unit` | `string` |
| `location` | `geo` |
| `governorate` | `gov` |
| `quality` | `enum:good|degraded|suspect` |
| `observedAt` | `date` |

Consumed by: `justice`, `resilience`, `safety-emergency`, `national-digital-twin`, `industrial-energy`, `smart-trade`, `food-water`, `health`, `education`, `talent`, `religious-heritage`, `mobility-logistics`, `infrastructure`, `environment`, `tourism`, `culture`

### `dns.sensor.registered.v1`

A new sensor joined the national fabric.

| Field | Type |
| --- | --- |
| `sensorId` | `string` |
| `sensorKind` | `string` |
| `governorate` | `gov` |
| `mode` | `enum:simulated|physical` |
| `ownerService` | `string` |
| `registeredAt` | `date` |

Consumed by: _nobody yet_

### `dns.edge-node.status.v1`

Edge node reachability and local inference load.

| Field | Type |
| --- | --- |
| `nodeId` | `string` |
| `governorate` | `gov` |
| `online` | `bool` |
| `inferenceLoad` | `unit` |
| `sensorsAttached` | `int` |
| `observedAt` | `date` |

Consumed by: _nobody yet_

### `dns.identity.verified.v1`

A pseudonymous identity assertion was verified.

| Field | Type |
| --- | --- |
| `assertionId` | `string` |
| `subjectPseudonym` | `string` |
| `method` | `enum:qr|nfc|otp|federated` |
| `service` | `string` |
| `verifiedAt` | `date` |

Consumed by: _nobody yet_


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `environment.air-quality.updated.v1` | environment | normal | Station readings validate the fabric against an independent publication. |
| `emergency.incident.created.v1` | safety-emergency | normal | Incidents localise where edge capacity must be reinforced. |
| `resilience.crisis.declared.v1` | resilience | critical | Crisis mode changes edge routing to store-and-forward. |
| `resilience.mesh-node.status.v1` | resilience | critical | Mesh nodes are edge nodes seen by the ministry that deploys them. |
| `infrastructure.asset-health.updated.v1` | infrastructure | critical | Telecom sites are infrastructure assets; their health is fabric health. |
| `energy.grid-load.updated.v1` | industrial-energy | critical | An edge node without power is an edge node that is gone. |
| `transport.resource.dispatched.v1` | mobility-logistics | normal | Moving resources carry sensors that join and leave the fabric. |
| `water.reservoir-level.updated.v1` | food-water | normal | Confirms that water sensors registered here are producing usable values. |
| `health.capacity.updated.v1` | health | normal | Facility connectivity is prioritised by criticality of the facility. |
| `education.school-condition.updated.v1` | education | normal | School connectivity is a fabric coverage question. |
| `land.parcel.updated.v1` | land | normal | Sensor and node siting is a land question. |
| `research.finding.released.v1` | research | normal | Edge inference and networking results are deployed on the fabric. |
| `twin.anomaly.detected.v1` | national-digital-twin | normal | An anomaly across sensors is often a fabric fault, not a real event. |
| `treasury.funding.approved.v1` | treasury | normal | Coverage extension programmes follow approved funding. |
| `tourism.site-pressure.detected.v1` | tourism | normal | Crowded sites are where public connectivity is most contested. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
