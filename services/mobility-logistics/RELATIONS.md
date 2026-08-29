# RELATIONS — Autonomous Mobility & Logistics Grid

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**19 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `environment` · `food-water` · `health` · `industrial-energy` · `infrastructure` · `justice` · `land` · `life-care` · `national-digital-twin` · `religious-heritage` · `resilience` · `safety-emergency` · `smart-trade` · `social-mobility` · `talent` · `tourism`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| safety-emergency | event | `emergency.incident.created.v1` | critical | An incident closes lanes and pulls resources; both are mobility facts. |
| safety-emergency | event | `emergency.resource.requested.v1` | critical | Emergency resource requests are dispatch orders for Transport. |
| health | event | `health.emergency.declared.v1` | critical | A health emergency is a transport mission with a clock. |
| health | event | `health.capacity.updated.v1` | critical | A resource is only correctly routed if the destination can receive it. |
| resilience | event | `resilience.resource-request.created.v1` | critical | Relief convoys are planned from crisis resource requests. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Crisis mode reprioritises the entire fleet. |
| environment | event | `environment.air-quality.updated.v1` | normal | Traffic is both a cause and a victim of poor air; both feed the corridor twin. |
| environment | event | `environment.climate-risk.updated.v1` | normal | Flood and heat risk close corridors before any incident is reported. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Traffic flow and GPS observations are the mobility twin. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | critical | A predicted bridge failure removes a corridor from every route. |
| infrastructure | event | `infrastructure.maintenance.scheduled.v1` | critical | Planned works are planned congestion. |
| smart-trade | event | `trade.shipment.updated.v1` | critical | Freight planning starts from the shipments that exist. |
| culture | event | `culture.event.scheduled.v1` | normal | A scheduled gathering is a demand spike with a known location and hour. |
| tourism | event | `tourism.visitor-flow.updated.v1` | normal | Seasonal visitor flows reshape corridor demand. |
| education | event | `education.school-condition.updated.v1` | normal | School location and status drive school transport planning. |
| food-water | event | `agriculture.yield.forecast.v1` | normal | Harvest volumes are freight demand with a season. |
| environment | api | `GET /air-quality` | normal | Air quality is read when a corridor plan is produced interactively. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `transport.congestion.detected.v1` | normal | Non-appearance correlates with corridor congestion on hearing days. |
| resilience | event | `transport.resource.dispatched.v1` | critical | The relief plan tracks coverage only if it sees what was actually dispatched. |
| resilience | api | `POST /dispatch` | critical | Relief logistics has no vehicles of its own; every convoy is dispatched through Transport. |
| safety-emergency | event | `transport.congestion.detected.v1` | critical | Congestion changes response time more than distance does. |
| safety-emergency | api | `POST /dispatch` | critical | Every ambulance, truck and boat belongs to Transport; dispatch is a call, not a database write. |
| national-digital-twin | event | `transport.mobility-demand.updated.v1` | critical | Mobility pressure is a component of the regional stress index. |
| national-digital-twin | api | `GET /flows` | normal | Direct read of mobility pressure when a scenario is run interactively. |
| social-mobility | event | `transport.mobility-demand.updated.v1` | normal | Transport access is one of the strongest predictors of employment access. |
| industrial-energy | event | `logistics.freight.updated.v1` | normal | Freight movement is the physical trace of industrial output. |
| smart-trade | event | `logistics.freight.updated.v1` | critical | A shipment without a freight movement is a plan, not a shipment. |
| smart-trade | event | `transport.congestion.detected.v1` | normal | Corridor congestion is the most common cause of a missed export window. |
| smart-trade | api | `GET /flows` | normal | Corridor state at the moment an export plan is produced. |
| health | event | `transport.resource.dispatched.v1` | critical | The hospital needs the ETA of what is coming to it. |
| health | api | `GET /resources/nearest` | critical | Inter-hospital transfer starts by finding the closest available ambulance. |
| education | event | `transport.mobility-demand.updated.v1` | normal | School transport is a large, predictable share of morning demand. |
| talent | event | `transport.mobility-demand.updated.v1` | normal | Match-day mobility is planned, not absorbed. |
| religious-heritage | event | `transport.mobility-demand.updated.v1` | normal | Access flows around historic quarters are a conservation variable. |
| digital-nervous-system | event | `transport.resource.dispatched.v1` | normal | Moving resources carry sensors that join and leave the fabric. |
| infrastructure | event | `transport.mobility-demand.updated.v1` | critical | Load is what wears a road; demand is the load. |
| infrastructure | event | `transport.congestion.detected.v1` | normal | Chronic congestion marks the segments that fail first. |
| infrastructure | api | `GET /flows` | normal | Traffic load is read when an asset health index is recomputed. |
| land | event | `transport.mobility-demand.updated.v1` | critical | Accessibility is one of the strongest terms in a suitability score. |
| environment | event | `transport.mobility-demand.updated.v1` | critical | Traffic is the second attributable source of urban air pollution. |
| environment | event | `transport.congestion.detected.v1` | normal | Congestion multiplies emissions per kilometre travelled. |
| tourism | event | `transport.congestion.detected.v1` | critical | Access time is the constraint that actually breaks an itinerary. |
| tourism | event | `transport.mobility-demand.updated.v1` | normal | Visitor flows and general mobility share the same corridors. |
| life-care | event | `transport.mobility-demand.updated.v1` | normal | Access to a care facility is a transport question for its users. |
| culture | event | `transport.mobility-demand.updated.v1` | normal | Event planning needs the corridor picture before the date is fixed. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
