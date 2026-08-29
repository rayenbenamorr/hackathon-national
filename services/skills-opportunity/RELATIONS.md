# RELATIONS — National Skills & Opportunity OS

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**15 partner ministries** out of 23 (target: 14).
`culture` · `education` · `food-water` · `global-tunisia` · `health` · `industrial-energy` · `infrastructure` · `life-care` · `national-digital-twin` · `research` · `smart-trade` · `social-mobility` · `talent` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| education | event | `education.program.updated.v1` | critical | Programmes are the supply side of the skills graph. |
| education | event | `education.learning-progress.updated.v1` | normal | Cohort mastery is how supply becomes real rather than enrolled. |
| research | event | `research.project.published.v1` | normal | Research activity is an advanced-skill demand signal. |
| research | event | `research.transfer.matched.v1` | normal | A technology transfer creates a specific, datable skill need. |
| industrial-energy | event | `industry.production.updated.v1` | critical | Industrial activity is the largest single source of skill demand. |
| food-water | event | `agriculture.yield.forecast.v1` | normal | Agricultural seasons drive predictable seasonal skill demand. |
| smart-trade | event | `trade.export-opportunity.detected.v1` | critical | An export opening is a skill requirement with a deadline. |
| infrastructure | event | `infrastructure.maintenance.scheduled.v1` | normal | Scheduled works are dated demand for named trades. |
| health | event | `health.capacity.updated.v1` | normal | Chronic saturation is a health workforce gap, not only a bed gap. |
| treasury | event | `treasury.funding.approved.v1` | normal | A funded programme is a hiring plan. |
| tourism | event | `tourism.visitor-flow.updated.v1` | normal | Seasonal tourism demand is seasonal skill demand. |
| global-tunisia | event | `global.diaspora-signal.updated.v1` | normal | Skills concentrated abroad are supply the national graph should count. |
| talent | event | `talent.performance.updated.v1` | normal | Youth pipelines feed both sport and the wider opportunity network. |
| social-mobility | event | `social.vulnerability.updated.v1` | critical | Micro-missions are placed where mobility is blocked, not where it is easy. |
| research | api | `GET /capability` | normal | Research capability is read when a career path targets an advanced domain. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| global-tunisia | event | `skills.gap.detected.v1` | critical | A national skill gap is exactly what the diaspora is asked to fill. |
| global-tunisia | event | `skills.micro-mission.published.v1` | normal | Remote missions are the lowest-friction way to mobilise expertise abroad. |
| global-tunisia | api | `GET /gaps` | normal | The opportunity engine ranks diaspora outreach against live regional gaps. |
| national-digital-twin | event | `skills.gap.detected.v1` | normal | Skill availability limits what a regional plan can actually execute. |
| social-mobility | event | `skills.gap.detected.v1` | normal | A gap next to a cohort is an opportunity, not only a shortage. |
| industrial-energy | event | `skills.gap.detected.v1` | normal | Operator and maintenance shortages cap what the grid can safely run. |
| smart-trade | event | `skills.gap.detected.v1` | normal | Certification and quality-control skills gate export readiness. |
| education | event | `skills.gap.detected.v1` | critical | A detected gap is the reason a programme is adapted; this is the core loop. |
| education | api | `GET /gaps` | critical | Programme adaptation reads live regional gaps rather than the last event. |
| research | event | `skills.gap.detected.v1` | normal | A persistent national gap is a research and training agenda. |
| talent | event | `skills.micro-mission.published.v1` | normal | Youth missions and sports pipelines share the same participants. |
| life-care | event | `skills.micro-mission.published.v1` | critical | Economic independence is built out of real, paid missions. |
| culture | event | `skills.gap.detected.v1` | normal | Conservation and creative trades are a measurable national skill gap. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
