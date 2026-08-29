# EVENTS — National Talent Intelligence Network

Contracts live in `packages/contracts/src/events/talent.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `talent.performance.updated.v1`

Aggregate performance for an athlete cohort.

| Field | Type |
| --- | --- |
| `cohortId` | `string` |
| `discipline` | `string` |
| `governorate` | `gov` |
| `performanceIndex` | `unit` |
| `athletes` | `int` |
| `updatedAt` | `date` |

Consumed by: `skills-opportunity`

### `talent.facility-usage.updated.v1`

Usage and condition at a sports facility.

| Field | Type |
| --- | --- |
| `facilityId` | `string` |
| `governorate` | `gov` |
| `weeklyUsers` | `int` |
| `condition` | `unit` |
| `energyKwhMonth` | `number` |
| `observedAt` | `date` |

Consumed by: `safety-emergency`, `education`, `tourism`, `life-care`

### `talent.injury-risk.flagged.v1`

Training load suggests elevated injury risk for a cohort.

| Field | Type |
| --- | --- |
| `riskId` | `string` |
| `cohortId` | `string` |
| `discipline` | `string` |
| `riskScore` | `unit` |
| `drivers` | `string[]` |
| `flaggedAt` | `date` |

Consumed by: `health`, `research`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Wearable and occupancy observations are the athlete and facility twins. |
| `health.capacity.updated.v1` | health | normal | Sports medicine capacity gates both competition and training volume. |
| `education.learning-progress.updated.v1` | education | normal | School sport is where the pipeline actually starts. |
| `education.school-condition.updated.v1` | education | normal | School facilities are the majority of accessible sports infrastructure. |
| `environment.air-quality.updated.v1` | environment | critical | Outdoor training on a high-particulate day is a measurable injury and health risk. |
| `environment.climate-risk.updated.v1` | environment | normal | Heat risk decides whether a session is held at all. |
| `infrastructure.asset-health.updated.v1` | infrastructure | critical | A stadium is an infrastructure asset before it is a venue. |
| `energy.grid-load.updated.v1` | industrial-energy | normal | Facility energy use is measured against the grid it sits on. |
| `social.vulnerability.updated.v1` | social-mobility | critical | Youth opportunity is targeted where mobility is blocked. |
| `skills.micro-mission.published.v1` | skills-opportunity | normal | Youth missions and sports pipelines share the same participants. |
| `culture.event.scheduled.v1` | culture | normal | Venues and calendars are shared with cultural programming. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | normal | Match-day mobility is planned, not absorbed. |
| `emergency.incident.created.v1` | safety-emergency | normal | Crowd incidents at venues change facility operating rules. |
| `treasury.budget-line.updated.v1` | treasury | normal | Facility maintenance and youth programmes follow the budget line. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
