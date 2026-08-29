# EVENTS — Tunisia Immersive Tourism OS

Contracts live in `packages/contracts/src/events/tourism.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `tourism.visitor-flow.updated.v1`

Visitor volume at a site or zone.

| Field | Type |
| --- | --- |
| `siteId` | `string` |
| `governorate` | `gov` |
| `visitorsWeek` | `int` |
| `originMix` | `string[]` |
| `observedAt` | `date` |

Consumed by: `safety-emergency`, `national-digital-twin`, `skills-opportunity`, `health`, `religious-heritage`, `mobility-logistics`, `culture`

### `tourism.site-pressure.detected.v1`

A site is over its sustainable capacity.

| Field | Type |
| --- | --- |
| `siteId` | `string` |
| `governorate` | `gov` |
| `pressureIndex` | `unit` |
| `capacity` | `int` |
| `visitorsWeek` | `int` |
| `detectedAt` | `date` |

Consumed by: `resilience`, `religious-heritage`, `digital-nervous-system`, `infrastructure`, `land`, `environment`, `culture`

### `tourism.experience.published.v1`

A new itinerary or AR experience is available.

| Field | Type |
| --- | --- |
| `experienceId` | `string` |
| `title` | `string` |
| `governorate` | `gov` |
| `sites` | `string[]` |
| `durationHours` | `int` |
| `publishedAt` | `date` |

Consumed by: `global-tunisia`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `environment.air-quality.updated.v1` | environment | critical | A bad air day is a bad visit; itineraries route around it. |
| `environment.water-quality.updated.v1` | environment | critical | Bathing water quality decides whether a beach can be recommended at all. |
| `environment.climate-risk.updated.v1` | environment | normal | Heat risk reshapes the summer offer towards inland and evening options. |
| `culture.event.scheduled.v1` | culture | critical | Cultural programming is the primary content of any itinerary. |
| `culture.asset-condition.updated.v1` | culture | critical | A closed or fragile asset must leave the itinerary immediately. |
| `heritage.site-condition.updated.v1` | religious-heritage | critical | Access limits at heritage sites are conservation decisions tourism must honour. |
| `transport.congestion.detected.v1` | mobility-logistics | critical | Access time is the constraint that actually breaks an itinerary. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | normal | Visitor flows and general mobility share the same corridors. |
| `health.capacity.updated.v1` | health | normal | Medical coverage is part of a responsible destination recommendation. |
| `emergency.incident.created.v1` | safety-emergency | critical | An incident at or near a site suspends recommendations for it. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Occupancy and noise observations are the site pressure index. |
| `global.diaspora-signal.updated.v1` | global-tunisia | normal | Diaspora travel is a distinct, forecastable segment. |
| `infrastructure.asset-health.updated.v1` | infrastructure | normal | Access roads, quays and walkways gate site capacity. |
| `resilience.crisis.declared.v1` | resilience | critical | A crisis withdraws affected zones from every published itinerary. |
| `talent.facility-usage.updated.v1` | talent | normal | Sporting events are a major and plannable driver of visitor flows. |
| `treasury.funding.approved.v1` | treasury | normal | Destination promotion and site upgrades exist once funded. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
