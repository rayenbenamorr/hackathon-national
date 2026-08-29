# RELATIONS — Life & Care Intelligence OS

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**14 partner ministries** out of 23 (target: 14).
`culture` · `education` · `environment` · `global-tunisia` · `health` · `justice` · `mobility-logistics` · `national-digital-twin` · `resilience` · `safety-emergency` · `skills-opportunity` · `social-mobility` · `talent` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| social-mobility | event | `social.vulnerability.updated.v1` | critical | Vulnerability and care need are the same household from two angles. |
| social-mobility | event | `social.household-need.detected.v1` | critical | A detected household need usually resolves into a care placement. |
| health | event | `health.capacity.updated.v1` | critical | Discharge planning is only possible if hospital pressure is visible. |
| health | event | `health.care-episode.updated.v1` | critical | A care episode ending is where the care network takes over. |
| education | event | `education.learning-progress.updated.v1` | normal | Schooling is the main childhood life transition the journey tracks. |
| skills-opportunity | event | `skills.micro-mission.published.v1` | critical | Economic independence is built out of real, paid missions. |
| treasury | event | `treasury.aid.disbursed.v1` | critical | Aid arrival is the event that changes an independence trajectory. |
| justice | event | `justice.case.filed.v1` | normal | Family and guardianship cases are life events with legal weight. |
| safety-emergency | event | `emergency.incident.created.v1` | normal | An incident affecting a household is a care trigger. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Care facilities are evacuation-priority sites with dependent occupants. |
| environment | event | `environment.climate-risk.updated.v1` | normal | Heat waves are a documented mortality risk for elderly cohorts. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | normal | Access to a care facility is a transport question for its users. |
| culture | event | `culture.event.scheduled.v1` | normal | Cultural participation is part of elderly and youth care programming. |
| talent | event | `talent.facility-usage.updated.v1` | normal | Youth clubs are shared between sport and care programming. |
| social-mobility | api | `GET /vulnerability` | critical | Coverage planning reads live vulnerability rather than the last event. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| global-tunisia | event | `care.life-event.recorded.v1` | normal | Civil-status life events abroad and at home must reconcile. |
| national-digital-twin | event | `care.facility-capacity.updated.v1` | normal | Care coverage is part of the social axis of the region state. |
| social-mobility | event | `care.support-need.detected.v1` | critical | Care needs and social needs are the same household seen from two ministries. |
| health | event | `care.facility-capacity.updated.v1` | critical | Discharge to a care facility is what frees a hospital bed. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
