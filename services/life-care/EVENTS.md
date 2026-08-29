# EVENTS — Life & Care Intelligence OS

Contracts live in `packages/contracts/src/events/life-care.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `care.life-event.recorded.v1`

A life transition was recorded for a cohort.

| Field | Type |
| --- | --- |
| `eventId` | `string` |
| `cohortId` | `string` |
| `eventType` | `enum:birth|schooling|graduation|employment|illness|retirement|bereavement|relocation` |
| `governorate` | `gov` |
| `people` | `int` |
| `recordedAt` | `date` |

Consumed by: `global-tunisia`

### `care.support-need.detected.v1`

A support need was inferred from a life event and other ministry signals.

| Field | Type |
| --- | --- |
| `needId` | `string` |
| `cohortId` | `string` |
| `needType` | `string` |
| `governorate` | `gov` |
| `urgency` | `enum:normal|high|critical` |
| `detectedAt` | `date` |

Consumed by: `social-mobility`

### `care.facility-capacity.updated.v1`

Care facility capacity changed.

| Field | Type |
| --- | --- |
| `facilityId` | `string` |
| `governorate` | `gov` |
| `capacity` | `int` |
| `occupied` | `int` |
| `waitingList` | `int` |
| `observedAt` | `date` |

Consumed by: `national-digital-twin`, `health`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `social.vulnerability.updated.v1` | social-mobility | critical | Vulnerability and care need are the same household from two angles. |
| `social.household-need.detected.v1` | social-mobility | critical | A detected household need usually resolves into a care placement. |
| `health.capacity.updated.v1` | health | critical | Discharge planning is only possible if hospital pressure is visible. |
| `health.care-episode.updated.v1` | health | critical | A care episode ending is where the care network takes over. |
| `education.learning-progress.updated.v1` | education | normal | Schooling is the main childhood life transition the journey tracks. |
| `skills.micro-mission.published.v1` | skills-opportunity | critical | Economic independence is built out of real, paid missions. |
| `treasury.aid.disbursed.v1` | treasury | critical | Aid arrival is the event that changes an independence trajectory. |
| `justice.case.filed.v1` | justice | normal | Family and guardianship cases are life events with legal weight. |
| `emergency.incident.created.v1` | safety-emergency | normal | An incident affecting a household is a care trigger. |
| `resilience.crisis.declared.v1` | resilience | critical | Care facilities are evacuation-priority sites with dependent occupants. |
| `environment.climate-risk.updated.v1` | environment | normal | Heat waves are a documented mortality risk for elderly cohorts. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | normal | Access to a care facility is a transport question for its users. |
| `culture.event.scheduled.v1` | culture | normal | Cultural participation is part of elderly and youth care programming. |
| `talent.facility-usage.updated.v1` | talent | normal | Youth clubs are shared between sport and care programming. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
