# EVENTS — National Skills & Opportunity OS

Contracts live in `packages/contracts/src/events/skills-opportunity.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `skills.gap.detected.v1`

Demand for a skill exceeds regional supply.

| Field | Type |
| --- | --- |
| `gapId` | `string` |
| `skill` | `string` |
| `domain` | `string` |
| `governorate` | `gov` |
| `gap` | `number` |
| `drivenBy` | `string[]` |
| `detectedAt` | `date` |

Consumed by: `global-tunisia`, `national-digital-twin`, `social-mobility`, `industrial-energy`, `smart-trade`, `education`, `research`, `culture`

### `skills.micro-mission.published.v1`

A short real assignment was opened against a gap.

| Field | Type |
| --- | --- |
| `missionId` | `string` |
| `title` | `string` |
| `skill` | `string` |
| `governorate` | `gov` |
| `durationDays` | `int` |
| `requestedBy` | `string` |
| `publishedAt` | `date` |

Consumed by: `global-tunisia`, `talent`, `life-care`

### `skills.profile.updated.v1`

Regional skill supply moved.

| Field | Type |
| --- | --- |
| `skill` | `string` |
| `governorate` | `gov` |
| `supplyIndex` | `unit` |
| `demandIndex` | `unit` |
| `updatedAt` | `date` |

Consumed by: _nobody yet_


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `education.program.updated.v1` | education | critical | Programmes are the supply side of the skills graph. |
| `education.learning-progress.updated.v1` | education | normal | Cohort mastery is how supply becomes real rather than enrolled. |
| `research.project.published.v1` | research | normal | Research activity is an advanced-skill demand signal. |
| `research.transfer.matched.v1` | research | normal | A technology transfer creates a specific, datable skill need. |
| `industry.production.updated.v1` | industrial-energy | critical | Industrial activity is the largest single source of skill demand. |
| `agriculture.yield.forecast.v1` | food-water | normal | Agricultural seasons drive predictable seasonal skill demand. |
| `trade.export-opportunity.detected.v1` | smart-trade | critical | An export opening is a skill requirement with a deadline. |
| `infrastructure.maintenance.scheduled.v1` | infrastructure | normal | Scheduled works are dated demand for named trades. |
| `health.capacity.updated.v1` | health | normal | Chronic saturation is a health workforce gap, not only a bed gap. |
| `treasury.funding.approved.v1` | treasury | normal | A funded programme is a hiring plan. |
| `tourism.visitor-flow.updated.v1` | tourism | normal | Seasonal tourism demand is seasonal skill demand. |
| `global.diaspora-signal.updated.v1` | global-tunisia | normal | Skills concentrated abroad are supply the national graph should count. |
| `talent.performance.updated.v1` | talent | normal | Youth pipelines feed both sport and the wider opportunity network. |
| `social.vulnerability.updated.v1` | social-mobility | critical | Micro-missions are placed where mobility is blocked, not where it is easy. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
