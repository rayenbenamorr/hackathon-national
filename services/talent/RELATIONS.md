# RELATIONS — National Talent Intelligence Network

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**15 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `environment` · `health` · `industrial-energy` · `infrastructure` · `life-care` · `mobility-logistics` · `research` · `safety-emergency` · `skills-opportunity` · `social-mobility` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Wearable and occupancy observations are the athlete and facility twins. |
| health | event | `health.capacity.updated.v1` | normal | Sports medicine capacity gates both competition and training volume. |
| education | event | `education.learning-progress.updated.v1` | normal | School sport is where the pipeline actually starts. |
| education | event | `education.school-condition.updated.v1` | normal | School facilities are the majority of accessible sports infrastructure. |
| environment | event | `environment.air-quality.updated.v1` | critical | Outdoor training on a high-particulate day is a measurable injury and health risk. |
| environment | event | `environment.climate-risk.updated.v1` | normal | Heat risk decides whether a session is held at all. |
| infrastructure | event | `infrastructure.asset-health.updated.v1` | critical | A stadium is an infrastructure asset before it is a venue. |
| industrial-energy | event | `energy.grid-load.updated.v1` | normal | Facility energy use is measured against the grid it sits on. |
| social-mobility | event | `social.vulnerability.updated.v1` | critical | Youth opportunity is targeted where mobility is blocked. |
| skills-opportunity | event | `skills.micro-mission.published.v1` | normal | Youth missions and sports pipelines share the same participants. |
| culture | event | `culture.event.scheduled.v1` | normal | Venues and calendars are shared with cultural programming. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | normal | Match-day mobility is planned, not absorbed. |
| safety-emergency | event | `emergency.incident.created.v1` | normal | Crowd incidents at venues change facility operating rules. |
| treasury | event | `treasury.budget-line.updated.v1` | normal | Facility maintenance and youth programmes follow the budget line. |
| health | api | `GET /capacity` | normal | Live medical capacity is checked before a large event is confirmed. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| safety-emergency | event | `talent.facility-usage.updated.v1` | normal | Stadium and gymnasium usage is crowd exposure. |
| skills-opportunity | event | `talent.performance.updated.v1` | normal | Youth pipelines feed both sport and the wider opportunity network. |
| health | event | `talent.injury-risk.flagged.v1` | normal | Sports injury load is predictable and lands in the same emergency rooms. |
| education | event | `talent.facility-usage.updated.v1` | normal | Sports facilities are shared with schools and scheduled against them. |
| research | event | `talent.injury-risk.flagged.v1` | normal | Sports science is applied physiology research with a live dataset. |
| tourism | event | `talent.facility-usage.updated.v1` | normal | Sporting events are a major and plannable driver of visitor flows. |
| life-care | event | `talent.facility-usage.updated.v1` | normal | Youth clubs are shared between sport and care programming. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
