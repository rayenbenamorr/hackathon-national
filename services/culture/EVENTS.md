# EVENTS — Tunisia Cultural Intelligence Network

Contracts live in `packages/contracts/src/events/culture.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `culture.asset-condition.updated.v1`

Condition of a cultural asset changed.

| Field | Type |
| --- | --- |
| `assetId` | `string` |
| `governorate` | `gov` |
| `conditionIndex` | `unit` |
| `protectionStatus` | `string` |
| `observedAt` | `date` |

Consumed by: `research`, `religious-heritage`, `land`, `tourism`

### `culture.event.scheduled.v1`

A cultural event was scheduled — mobility, safety and tourism plan against it.

| Field | Type |
| --- | --- |
| `eventId` | `string` |
| `title` | `string` |
| `governorate` | `gov` |
| `location` | `geo` |
| `expectedAttendance` | `int` |
| `startsAt` | `date` |

Consumed by: `safety-emergency`, `global-tunisia`, `education`, `talent`, `mobility-logistics`, `environment`, `tourism`, `life-care`

### `culture.creative-economy.updated.v1`

Creative activity and revenue for a governorate.

| Field | Type |
| --- | --- |
| `governorate` | `gov` |
| `activeCreators` | `int` |
| `revenueTnd` | `number` |
| `dominantDiscipline` | `string` |
| `updatedAt` | `date` |

Consumed by: `national-digital-twin`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Humidity, temperature and vibration observations are the asset condition twin. |
| `environment.air-quality.updated.v1` | environment | critical | Pollution is the slow destroyer of monuments and open-air sites. |
| `environment.climate-risk.updated.v1` | environment | critical | Flood and humidity risk set the conservation queue. |
| `tourism.visitor-flow.updated.v1` | tourism | critical | Visitor load is the main controllable pressure on cultural assets. |
| `tourism.site-pressure.detected.v1` | tourism | critical | Over-capacity means restricting access, which Culture decides. |
| `heritage.site-condition.updated.v1` | religious-heritage | critical | Shared assets must not carry two contradictory condition records. |
| `infrastructure.failure.predicted.v1` | infrastructure | critical | Museums and monuments are buildings with predictable failure modes. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | normal | Event planning needs the corridor picture before the date is fixed. |
| `education.program.updated.v1` | education | normal | Cultural education programmes and the asset register are planned together. |
| `skills.gap.detected.v1` | skills-opportunity | normal | Conservation and creative trades are a measurable national skill gap. |
| `treasury.funding.approved.v1` | treasury | critical | Restoration and creative programmes exist once funded. |
| `emergency.incident.created.v1` | safety-emergency | critical | Fire or flood at a cultural asset is irreversible; response must be immediate. |
| `research.finding.released.v1` | research | normal | Conservation science results change how assets are treated. |
| `global.opportunity.published.v1` | global-tunisia | normal | Diaspora audiences and funding are part of the creative economy. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
