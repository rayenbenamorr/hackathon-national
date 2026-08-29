# RELATIONS — Tunisia Immersive Tourism OS

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**15 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `environment` · `global-tunisia` · `health` · `infrastructure` · `land` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `resilience` · `safety-emergency` · `skills-opportunity` · `talent` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| environment | event | `environment.air-quality.updated.v1` | critical | A bad air day is a bad visit; itineraries route around it. |
| environment | event | `environment.water-quality.updated.v1` | critical | Bathing water quality decides whether a beach can be recommended at all. |
| environment | event | `environment.climate-risk.updated.v1` | normal | Heat risk reshapes the summer offer towards inland and evening options. |
| culture | event | `culture.event.scheduled.v1` | critical | Cultural programming is the primary content of any itinerary. |
| culture | event | `culture.asset-condition.updated.v1` | critical | A closed or fragile asset must leave the itinerary immediately. |
| religious-heritage | event | `heritage.site-condition.updated.v1` | critical | Access limits at heritage sites are conservation decisions tourism must honour. |
| mobility-logistics | event | `transport.congestion.detected.v1` | critical | Access time is the constraint that actually breaks an itinerary. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | normal | Visitor flows and general mobility share the same corridors. |
| health | event | `health.capacity.updated.v1` | normal | Medical coverage is part of a responsible destination recommendation. |
| safety-emergency | event | `emergency.incident.created.v1` | critical | An incident at or near a site suspends recommendations for it. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Occupancy and noise observations are the site pressure index. |
| global-tunisia | event | `global.diaspora-signal.updated.v1` | normal | Diaspora travel is a distinct, forecastable segment. |
| infrastructure | event | `infrastructure.asset-health.updated.v1` | normal | Access roads, quays and walkways gate site capacity. |
| resilience | event | `resilience.crisis.declared.v1` | critical | A crisis withdraws affected zones from every published itinerary. |
| talent | event | `talent.facility-usage.updated.v1` | normal | Sporting events are a major and plannable driver of visitor flows. |
| treasury | event | `treasury.funding.approved.v1` | normal | Destination promotion and site upgrades exist once funded. |
| environment | api | `GET /air-quality` | critical | Air quality is read at itinerary build time, not from the last event. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| resilience | event | `tourism.site-pressure.detected.v1` | normal | Visitor concentration changes the population actually present in a zone. |
| safety-emergency | event | `tourism.visitor-flow.updated.v1` | normal | Visitor volume changes how many people are in a zone at a given hour. |
| global-tunisia | event | `tourism.experience.published.v1` | normal | Diaspora visits are a distinct, high-value tourism segment. |
| national-digital-twin | event | `tourism.visitor-flow.updated.v1` | normal | Seasonal population is not resident population; the model needs both. |
| skills-opportunity | event | `tourism.visitor-flow.updated.v1` | normal | Seasonal tourism demand is seasonal skill demand. |
| health | event | `tourism.visitor-flow.updated.v1` | normal | Seasonal population changes the denominator of every capacity ratio. |
| religious-heritage | event | `tourism.visitor-flow.updated.v1` | critical | Visitor pressure is the fastest controllable driver of degradation. |
| religious-heritage | event | `tourism.site-pressure.detected.v1` | critical | Over-capacity is the signal that access must be regulated. |
| digital-nervous-system | event | `tourism.site-pressure.detected.v1` | normal | Crowded sites are where public connectivity is most contested. |
| mobility-logistics | event | `tourism.visitor-flow.updated.v1` | normal | Seasonal visitor flows reshape corridor demand. |
| infrastructure | event | `tourism.site-pressure.detected.v1` | normal | Visitor load is structural load on stairs, walkways and quays. |
| land | event | `tourism.site-pressure.detected.v1` | normal | Touristic zoning pressure is measured, not assumed. |
| environment | event | `tourism.site-pressure.detected.v1` | normal | Concentrated visitors are a local environmental pressure. |
| culture | event | `tourism.visitor-flow.updated.v1` | critical | Visitor load is the main controllable pressure on cultural assets. |
| culture | event | `tourism.site-pressure.detected.v1` | critical | Over-capacity means restricting access, which Culture decides. |
| culture | api | `GET /flows` | normal | Visitor pressure is read when a cultural event is planned. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
