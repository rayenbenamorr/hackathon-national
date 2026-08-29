# EVENTS — Adaptive Education OS

Contracts live in `packages/contracts/src/events/education.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `education.learning-progress.updated.v1`

Cohort mastery moved for a domain.

| Field | Type |
| --- | --- |
| `cohortId` | `string` |
| `governorate` | `gov` |
| `domain` | `string` |
| `masteryIndex` | `unit` |
| `pupils` | `int` |
| `updatedAt` | `date` |

Consumed by: `social-mobility`, `skills-opportunity`, `talent`, `life-care`

### `education.program.updated.v1`

A programme was created or adapted, usually against a detected skill gap.

| Field | Type |
| --- | --- |
| `programId` | `string` |
| `title` | `string` |
| `level` | `string` |
| `discipline` | `string` |
| `governorate` | `gov` |
| `reason` | `text` |
| `updatedAt` | `date` |

Consumed by: `global-tunisia`, `treasury`, `skills-opportunity`, `research`, `religious-heritage`, `culture`

### `education.school-condition.updated.v1`

Building or environmental condition at a school changed.

| Field | Type |
| --- | --- |
| `schoolId` | `string` |
| `governorate` | `gov` |
| `buildingCondition` | `unit` |
| `airQualityIndex` | `number` |
| `pupils` | `int` |
| `observedAt` | `date` |

Consumed by: `resilience`, `safety-emergency`, `national-digital-twin`, `social-mobility`, `health`, `talent`, `digital-nervous-system`, `mobility-logistics`, `infrastructure`, `land`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `skills.gap.detected.v1` | skills-opportunity | critical | A detected gap is the reason a programme is adapted; this is the core loop. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | School air quality, occupancy and temperature are the school twin. |
| `environment.air-quality.updated.v1` | environment | critical | Poor air in a school is a decision to take today, not a statistic. |
| `infrastructure.asset-health.updated.v1` | infrastructure | critical | A school building is an infrastructure asset with a health index. |
| `infrastructure.failure.predicted.v1` | infrastructure | normal | A predicted building failure means relocating pupils, with notice. |
| `social.vulnerability.updated.v1` | social-mobility | critical | Dropout risk is a social signal before it is an academic one. |
| `research.finding.released.v1` | research | normal | Pedagogy and curriculum results enter the knowledge graph. |
| `treasury.budget-line.updated.v1` | treasury | normal | Class sizes and equipment follow the education budget line. |
| `health.epidemic-signal.detected.v1` | health | critical | School closure and reopening decisions follow the health signal. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | normal | School transport is a large, predictable share of morning demand. |
| `culture.event.scheduled.v1` | culture | normal | Cultural programming is part of the school calendar. |
| `industry.production.updated.v1` | industrial-energy | normal | Local industry defines which vocational tracks have a local outlet. |
| `resilience.crisis.declared.v1` | resilience | critical | Schools become shelters; the education system must know first. |
| `talent.facility-usage.updated.v1` | talent | normal | Sports facilities are shared with schools and scheduled against them. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
