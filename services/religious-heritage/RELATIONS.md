# RELATIONS — Smart Religious Heritage Network

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**15 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `environment` · `industrial-energy` · `infrastructure` · `land` · `mobility-logistics` · `national-digital-twin` · `research` · `resilience` · `safety-emergency` · `social-mobility` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Humidity, vibration and strain observations are the site condition twin. |
| environment | event | `environment.air-quality.updated.v1` | critical | Particulates and pollutants are the main slow destroyer of historic fabric. |
| environment | event | `environment.climate-risk.updated.v1` | critical | Humidity and flood risk decide conservation priority. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | critical | Historic buildings are infrastructure assets with irreplaceable value. |
| infrastructure | event | `infrastructure.maintenance.scheduled.v1` | normal | Conservation work is scheduled through the same maintenance system. |
| industrial-energy | event | `energy.grid-load.updated.v1` | normal | Site energy systems are optimised against the local grid. |
| culture | event | `culture.asset-condition.updated.v1` | critical | Many sites are both religious and cultural assets; conditions must agree. |
| tourism | event | `tourism.visitor-flow.updated.v1` | critical | Visitor pressure is the fastest controllable driver of degradation. |
| tourism | event | `tourism.site-pressure.detected.v1` | critical | Over-capacity is the signal that access must be regulated. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | normal | Access flows around historic quarters are a conservation variable. |
| research | event | `research.finding.released.v1` | normal | Conservation science results are adopted directly by the sensor network. |
| safety-emergency | event | `emergency.incident.created.v1` | normal | Fire and structural incidents at sites need an immediate, specific response. |
| treasury | event | `treasury.funding.approved.v1` | normal | Restoration programmes exist only once funded. |
| education | event | `education.program.updated.v1` | normal | Heritage education programmes are built on the knowledge graph. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Historic sites are protection and evacuation priorities the moment a crisis is declared. |
| land | event | `land.zoning.changed.v1` | normal | What may be built next to a protected site is decided by zoning around it. |
| social-mobility | event | `social.vulnerability.updated.v1` | normal | Zaouias and madrasas remain community services in the most fragile neighbourhoods. |
| national-digital-twin | event | `twin.state.updated.v1` | normal | Regional state orders the conservation queue between governorates. |
| culture | api | `GET /assets/condition` | normal | Shared assets are reconciled against Culture own condition record. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| infrastructure | event | `heritage.site-condition.updated.v1` | normal | Historic structures need maintenance rules of their own, from the same system. |
| tourism | event | `heritage.site-condition.updated.v1` | critical | Access limits at heritage sites are conservation decisions tourism must honour. |
| culture | event | `heritage.site-condition.updated.v1` | critical | Shared assets must not carry two contradictory condition records. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
