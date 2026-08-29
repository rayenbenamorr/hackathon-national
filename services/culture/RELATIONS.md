# RELATIONS — Tunisia Cultural Intelligence Network

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**16 partner ministries** out of 23 (target: 14).
`digital-nervous-system` · `education` · `environment` · `global-tunisia` · `infrastructure` · `land` · `life-care` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `research` · `safety-emergency` · `skills-opportunity` · `talent` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Humidity, temperature and vibration observations are the asset condition twin. |
| environment | event | `environment.air-quality.updated.v1` | critical | Pollution is the slow destroyer of monuments and open-air sites. |
| environment | event | `environment.climate-risk.updated.v1` | critical | Flood and humidity risk set the conservation queue. |
| tourism | event | `tourism.visitor-flow.updated.v1` | critical | Visitor load is the main controllable pressure on cultural assets. |
| tourism | event | `tourism.site-pressure.detected.v1` | critical | Over-capacity means restricting access, which Culture decides. |
| religious-heritage | event | `heritage.site-condition.updated.v1` | critical | Shared assets must not carry two contradictory condition records. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | critical | Museums and monuments are buildings with predictable failure modes. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | normal | Event planning needs the corridor picture before the date is fixed. |
| education | event | `education.program.updated.v1` | normal | Cultural education programmes and the asset register are planned together. |
| skills-opportunity | event | `skills.gap.detected.v1` | normal | Conservation and creative trades are a measurable national skill gap. |
| treasury | event | `treasury.funding.approved.v1` | critical | Restoration and creative programmes exist once funded. |
| safety-emergency | event | `emergency.incident.created.v1` | critical | Fire or flood at a cultural asset is irreversible; response must be immediate. |
| research | event | `research.finding.released.v1` | normal | Conservation science results change how assets are treated. |
| global-tunisia | event | `global.opportunity.published.v1` | normal | Diaspora audiences and funding are part of the creative economy. |
| tourism | api | `GET /flows` | normal | Visitor pressure is read when a cultural event is planned. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| safety-emergency | event | `culture.event.scheduled.v1` | normal | A scheduled gathering changes both crowd risk and the resources to pre-position. |
| global-tunisia | event | `culture.event.scheduled.v1` | normal | Cultural programming is the main reason diaspora travel is planned. |
| national-digital-twin | event | `culture.creative-economy.updated.v1` | normal | Creative activity is a measurable part of regional economic activity. |
| education | event | `culture.event.scheduled.v1` | normal | Cultural programming is part of the school calendar. |
| research | event | `culture.asset-condition.updated.v1` | normal | Conservation science is driven by measured asset degradation. |
| talent | event | `culture.event.scheduled.v1` | normal | Venues and calendars are shared with cultural programming. |
| religious-heritage | event | `culture.asset-condition.updated.v1` | critical | Many sites are both religious and cultural assets; conditions must agree. |
| religious-heritage | api | `GET /assets/condition` | normal | Shared assets are reconciled against Culture own condition record. |
| mobility-logistics | event | `culture.event.scheduled.v1` | normal | A scheduled gathering is a demand spike with a known location and hour. |
| land | event | `culture.asset-condition.updated.v1` | normal | Protected cultural assets constrain neighbouring parcels. |
| environment | event | `culture.event.scheduled.v1` | normal | Large events produce a measurable, plannable waste stream. |
| tourism | event | `culture.event.scheduled.v1` | critical | Cultural programming is the primary content of any itinerary. |
| tourism | event | `culture.asset-condition.updated.v1` | critical | A closed or fragile asset must leave the itinerary immediately. |
| life-care | event | `culture.event.scheduled.v1` | normal | Cultural participation is part of elderly and youth care programming. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
