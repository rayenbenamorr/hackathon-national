# RELATIONS — Adaptive Education OS

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**19 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `environment` · `global-tunisia` · `health` · `industrial-energy` · `infrastructure` · `land` · `life-care` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `research` · `resilience` · `safety-emergency` · `skills-opportunity` · `social-mobility` · `talent` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| skills-opportunity | event | `skills.gap.detected.v1` | critical | A detected gap is the reason a programme is adapted; this is the core loop. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | School air quality, occupancy and temperature are the school twin. |
| environment | event | `environment.air-quality.updated.v1` | critical | Poor air in a school is a decision to take today, not a statistic. |
| infrastructure | event | `infrastructure.asset-health.updated.v1` | critical | A school building is an infrastructure asset with a health index. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | normal | A predicted building failure means relocating pupils, with notice. |
| social-mobility | event | `social.vulnerability.updated.v1` | critical | Dropout risk is a social signal before it is an academic one. |
| research | event | `research.finding.released.v1` | normal | Pedagogy and curriculum results enter the knowledge graph. |
| treasury | event | `treasury.budget-line.updated.v1` | normal | Class sizes and equipment follow the education budget line. |
| health | event | `health.epidemic-signal.detected.v1` | critical | School closure and reopening decisions follow the health signal. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | normal | School transport is a large, predictable share of morning demand. |
| culture | event | `culture.event.scheduled.v1` | normal | Cultural programming is part of the school calendar. |
| industrial-energy | event | `industry.production.updated.v1` | normal | Local industry defines which vocational tracks have a local outlet. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Schools become shelters; the education system must know first. |
| talent | event | `talent.facility-usage.updated.v1` | normal | Sports facilities are shared with schools and scheduled against them. |
| skills-opportunity | api | `GET /gaps` | critical | Programme adaptation reads live regional gaps rather than the last event. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| resilience | event | `education.school-condition.updated.v1` | normal | Schools are the default shelter network; their condition decides which can be used. |
| safety-emergency | event | `education.school-condition.updated.v1` | normal | School condition and occupancy shape the response to a building incident. |
| global-tunisia | event | `education.program.updated.v1` | normal | Recognition and equivalence questions follow programme changes. |
| treasury | event | `education.program.updated.v1` | normal | A new programme is a recurring cost that must enter the fiscal year. |
| national-digital-twin | event | `education.school-condition.updated.v1` | normal | School condition is a durable component of regional capability. |
| social-mobility | event | `education.learning-progress.updated.v1` | critical | Schooling outcomes are a core axis of social mobility. |
| social-mobility | event | `education.school-condition.updated.v1` | normal | A degraded school is a mobility constraint on the cohort around it. |
| skills-opportunity | event | `education.program.updated.v1` | critical | Programmes are the supply side of the skills graph. |
| skills-opportunity | event | `education.learning-progress.updated.v1` | normal | Cohort mastery is how supply becomes real rather than enrolled. |
| health | event | `education.school-condition.updated.v1` | normal | School air quality and crowding are paediatric health signals. |
| research | event | `education.program.updated.v1` | normal | Programmes and research capability must stay in the same graph. |
| talent | event | `education.learning-progress.updated.v1` | normal | School sport is where the pipeline actually starts. |
| talent | event | `education.school-condition.updated.v1` | normal | School facilities are the majority of accessible sports infrastructure. |
| religious-heritage | event | `education.program.updated.v1` | normal | Heritage education programmes are built on the knowledge graph. |
| digital-nervous-system | event | `education.school-condition.updated.v1` | normal | School connectivity is a fabric coverage question. |
| mobility-logistics | event | `education.school-condition.updated.v1` | normal | School location and status drive school transport planning. |
| infrastructure | event | `education.school-condition.updated.v1` | normal | School buildings are part of the public asset base. |
| land | event | `education.school-condition.updated.v1` | normal | School siting is a land decision with a 40-year horizon. |
| life-care | event | `education.learning-progress.updated.v1` | normal | Schooling is the main childhood life transition the journey tracks. |
| culture | event | `education.program.updated.v1` | normal | Cultural education programmes and the asset register are planned together. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
