# RELATIONS — Smart Infrastructure OS

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**20 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `environment` · `food-water` · `health` · `industrial-energy` · `land` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `research` · `resilience` · `safety-emergency` · `skills-opportunity` · `smart-trade` · `social-mobility` · `talent` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Vibration, strain and water-level observations are the asset health index. |
| environment | event | `environment.climate-risk.updated.v1` | critical | Flood and heat risk are the dominant accelerators of asset degradation. |
| environment | event | `environment.water-quality.updated.v1` | normal | Water chemistry drives corrosion in networks and structures. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | critical | Load is what wears a road; demand is the load. |
| mobility-logistics | event | `transport.congestion.detected.v1` | normal | Chronic congestion marks the segments that fail first. |
| safety-emergency | event | `emergency.incident.created.v1` | critical | Incidents on an asset are the strongest evidence its health index is wrong. |
| industrial-energy | event | `energy.grid-load.updated.v1` | critical | Power lines and substations are infrastructure assets under electrical load. |
| food-water | event | `agriculture.water-demand.predicted.v1` | critical | Water networks are sized and stressed by demand. |
| treasury | event | `treasury.funding.approved.v1` | critical | A maintenance order without funding is a wish. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Crisis reprioritises maintenance towards what the response depends on. |
| land | event | `land.zoning.changed.v1` | normal | New zoning creates infrastructure obligations before it creates buildings. |
| education | event | `education.school-condition.updated.v1` | normal | School buildings are part of the public asset base. |
| health | event | `health.capacity.updated.v1` | normal | Hospitals are critical assets; their continuity sets maintenance priority. |
| religious-heritage | event | `heritage.site-condition.updated.v1` | normal | Historic structures need maintenance rules of their own, from the same system. |
| tourism | event | `tourism.site-pressure.detected.v1` | normal | Visitor load is structural load on stairs, walkways and quays. |
| mobility-logistics | api | `GET /flows` | normal | Traffic load is read when an asset health index is recomputed. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| resilience | event | `infrastructure.failure.predicted.v1` | critical | A predicted bridge or network failure changes every evacuation route. |
| safety-emergency | event | `infrastructure.failure.predicted.v1` | critical | A failing bridge is a road-risk input and a route exclusion at the same time. |
| treasury | event | `infrastructure.failure.predicted.v1` | critical | Predicted failure lets maintenance be budgeted instead of emergency-funded. |
| treasury | event | `infrastructure.maintenance.scheduled.v1` | normal | Scheduled work orders are the committed half of the infrastructure budget. |
| national-digital-twin | event | `infrastructure.asset-health.updated.v1` | critical | Asset health bounds what any scenario can assume about capacity. |
| social-mobility | event | `infrastructure.asset-health.updated.v1` | normal | Water and power network health is lived as household quality. |
| industrial-energy | event | `infrastructure.failure.predicted.v1` | critical | A predicted power-line failure is an outage risk before it is a maintenance order. |
| smart-trade | event | `infrastructure.asset-health.updated.v1` | critical | Port and rail health is a hard constraint on export capacity. |
| food-water | event | `infrastructure.failure.predicted.v1` | critical | A failing water network turns available water into unavailable water. |
| skills-opportunity | event | `infrastructure.maintenance.scheduled.v1` | normal | Scheduled works are dated demand for named trades. |
| education | event | `infrastructure.asset-health.updated.v1` | critical | A school building is an infrastructure asset with a health index. |
| education | event | `infrastructure.failure.predicted.v1` | normal | A predicted building failure means relocating pupils, with notice. |
| research | event | `infrastructure.failure.predicted.v1` | normal | Materials and structural research follows real failure modes. |
| talent | event | `infrastructure.asset-health.updated.v1` | critical | A stadium is an infrastructure asset before it is a venue. |
| religious-heritage | event | `infrastructure.failure.predicted.v1` | critical | Historic buildings are infrastructure assets with irreplaceable value. |
| religious-heritage | event | `infrastructure.maintenance.scheduled.v1` | normal | Conservation work is scheduled through the same maintenance system. |
| digital-nervous-system | event | `infrastructure.asset-health.updated.v1` | critical | Telecom sites are infrastructure assets; their health is fabric health. |
| mobility-logistics | event | `infrastructure.failure.predicted.v1` | critical | A predicted bridge failure removes a corridor from every route. |
| mobility-logistics | event | `infrastructure.maintenance.scheduled.v1` | critical | Planned works are planned congestion. |
| land | event | `infrastructure.asset-health.updated.v1` | critical | A site is only suitable if the networks reaching it are. |
| environment | event | `infrastructure.failure.predicted.v1` | normal | Sewage and network failures are pollution events waiting to happen. |
| tourism | event | `infrastructure.asset-health.updated.v1` | normal | Access roads, quays and walkways gate site capacity. |
| culture | event | `infrastructure.failure.predicted.v1` | critical | Museums and monuments are buildings with predictable failure modes. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
