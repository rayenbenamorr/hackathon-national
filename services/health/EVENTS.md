# EVENTS — Connected Health Intelligence System

Contracts live in `packages/contracts/src/events/health.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `health.capacity.updated.v1`

Bed and emergency capacity at a facility. Consumed widely — dispatch depends on it.

| Field | Type |
| --- | --- |
| `facilityId` | `string` |
| `governorate` | `gov` |
| `location` | `geo` |
| `totalBeds` | `int` |
| `availableBeds` | `int` |
| `icuAvailable` | `int` |
| `emergencyLoad` | `unit` |
| `observedAt` | `date` |

Consumed by: `resilience`, `safety-emergency`, `treasury`, `national-digital-twin`, `social-mobility`, `skills-opportunity`, `talent`, `digital-nervous-system`, `mobility-logistics`, `infrastructure`, `tourism`, `life-care`

### `health.epidemic-signal.detected.v1`

An unusual health signal was detected in a governorate.

| Field | Type |
| --- | --- |
| `signalId` | `string` |
| `governorate` | `gov` |
| `syndrome` | `string` |
| `excessCases` | `int` |
| `confidence` | `unit` |
| `suspectedDrivers` | `string[]` |
| `detectedAt` | `date` |

Consumed by: `justice`, `global-tunisia`, `social-mobility`, `smart-trade`, `food-water`, `education`, `research`

### `health.emergency.declared.v1`

Health declares an emergency requiring resources it does not own.

| Field | Type |
| --- | --- |
| `emergencyId` | `string` |
| `governorate` | `gov` |
| `location` | `geo` |
| `requiredResources` | `string[]` |
| `patients` | `int` |
| `declaredAt` | `date` |

Consumed by: `safety-emergency`, `mobility-logistics`

### `health.care-episode.updated.v1`

Aggregate care activity for a cohort.

| Field | Type |
| --- | --- |
| `cohortId` | `string` |
| `governorate` | `gov` |
| `episodes` | `int` |
| `averageStayDays` | `number` |
| `updatedAt` | `date` |

Consumed by: `life-care`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `environment.air-quality.updated.v1` | environment | critical | Respiratory admissions follow particulate load with a short, known lag. |
| `environment.water-quality.updated.v1` | environment | critical | Water-borne disease surveillance starts at the water station, not at the ward. |
| `environment.climate-risk.updated.v1` | environment | normal | Heat risk is a direct predictor of emergency load in vulnerable cohorts. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Wearable and facility observations feed the cohort and hospital twins. |
| `emergency.incident.created.v1` | safety-emergency | critical | Incoming casualties are known from the incident, before they arrive. |
| `transport.resource.dispatched.v1` | mobility-logistics | critical | The hospital needs the ETA of what is coming to it. |
| `social.vulnerability.updated.v1` | social-mobility | critical | Vulnerable cohorts need outreach, not availability. |
| `agriculture.water-shortage.predicted.v1` | food-water | normal | Water shortage has a documented health consequence within weeks. |
| `education.school-condition.updated.v1` | education | normal | School air quality and crowding are paediatric health signals. |
| `resilience.crisis.declared.v1` | resilience | critical | Crisis mode changes triage rules and capacity reporting frequency. |
| `care.facility-capacity.updated.v1` | life-care | critical | Discharge to a care facility is what frees a hospital bed. |
| `energy.outage-risk.flagged.v1` | industrial-energy | critical | An ICU without power is an evacuation, planned in advance or not at all. |
| `tourism.visitor-flow.updated.v1` | tourism | normal | Seasonal population changes the denominator of every capacity ratio. |
| `talent.injury-risk.flagged.v1` | talent | normal | Sports injury load is predictable and lands in the same emergency rooms. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
