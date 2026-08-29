# RELATIONS — National Resilience Command System

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**19 partner ministries** out of 23 (target: 14).
`digital-nervous-system` · `education` · `environment` · `food-water` · `global-tunisia` · `health` · `industrial-energy` · `infrastructure` · `justice` · `land` · `life-care` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `safety-emergency` · `smart-trade` · `social-mobility` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| safety-emergency | event | `emergency.incident.created.v1` | critical | Clustered incidents are how a crisis is first detected, before anyone declares one. |
| environment | event | `environment.climate-risk.updated.v1` | critical | Drought, heat and flood risk are the leading indicators the command system watches. |
| food-water | event | `agriculture.water-shortage.predicted.v1` | critical | A predicted water shortage is a slow-onset crisis; declaring early is the whole point. |
| health | event | `health.capacity.updated.v1` | critical | A relief plan that ignores hospital saturation sends people where they cannot be treated. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | critical | A predicted bridge or network failure changes every evacuation route. |
| industrial-energy | event | `energy.outage-risk.flagged.v1` | normal | Power shortfall determines which shelters and hospitals need generators. |
| mobility-logistics | event | `transport.resource.dispatched.v1` | critical | The relief plan tracks coverage only if it sees what was actually dispatched. |
| social-mobility | event | `social.vulnerability.updated.v1` | critical | Evacuation and aid priority follow vulnerability, not geography alone. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Water level, rainfall and wind observations drive early crisis detection. |
| treasury | event | `treasury.funding.approved.v1` | normal | A relief plan is only real once its funding is approved. |
| land | event | `land.site-suitability.scored.v1` | normal | Shelter and staging sites come from land suitability, scored in advance. |
| education | event | `education.school-condition.updated.v1` | normal | Schools are the default shelter network; their condition decides which can be used. |
| tourism | event | `tourism.site-pressure.detected.v1` | normal | Visitor concentration changes the population actually present in a zone. |
| national-digital-twin | event | `twin.anomaly.detected.v1` | normal | Multi-sector anomalies are early crisis signatures. |
| mobility-logistics | api | `POST /dispatch` | critical | Relief logistics has no vehicles of its own; every convoy is dispatched through Transport. |
| health | api | `GET /capacity` | critical | Casualty routing needs live bed and ICU availability at plan time, not at event time. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `resilience.crisis.declared.v1` | critical | A declared crisis suspends deadlines and moves hearings — the workflow must know immediately. |
| safety-emergency | event | `resilience.crisis.declared.v1` | critical | Under a declared crisis the grid switches to crisis dispatch rules. |
| global-tunisia | event | `resilience.crisis.declared.v1` | critical | A crisis at home triggers consular contact procedures for affected families. |
| treasury | event | `resilience.relief-plan.updated.v1` | critical | A relief plan is a spending commitment; the treasury twin must see it as it forms. |
| treasury | event | `resilience.resource-request.created.v1` | critical | Resource requests are funding requests wearing another name. |
| national-digital-twin | event | `resilience.crisis.declared.v1` | critical | A declared crisis switches the twin into crisis mode for that zone. |
| social-mobility | event | `resilience.crisis.declared.v1` | critical | Crisis response must be ordered by vulnerability, which means seeing the declaration. |
| industrial-energy | event | `resilience.crisis.declared.v1` | critical | Crisis load-shedding priorities are set from the declaration. |
| smart-trade | event | `resilience.crisis.declared.v1` | normal | A crisis reroutes or blocks corridors and shipments. |
| food-water | event | `resilience.crisis.declared.v1` | critical | Under drought crisis the grid switches to allocation rather than demand-following. |
| health | event | `resilience.crisis.declared.v1` | critical | Crisis mode changes triage rules and capacity reporting frequency. |
| education | event | `resilience.crisis.declared.v1` | critical | Schools become shelters; the education system must know first. |
| religious-heritage | event | `resilience.crisis.declared.v1` | critical | Historic sites are protection and evacuation priorities the moment a crisis is declared. |
| digital-nervous-system | event | `resilience.crisis.declared.v1` | critical | Crisis mode changes edge routing to store-and-forward. |
| digital-nervous-system | event | `resilience.mesh-node.status.v1` | critical | Mesh nodes are edge nodes seen by the ministry that deploys them. |
| mobility-logistics | event | `resilience.resource-request.created.v1` | critical | Relief convoys are planned from crisis resource requests. |
| mobility-logistics | event | `resilience.crisis.declared.v1` | critical | Crisis mode reprioritises the entire fleet. |
| infrastructure | event | `resilience.crisis.declared.v1` | critical | Crisis reprioritises maintenance towards what the response depends on. |
| land | event | `resilience.crisis.declared.v1` | normal | Crisis staging areas are drawn from the public asset register. |
| environment | event | `resilience.crisis.declared.v1` | normal | Crisis mode raises sampling frequency in the affected zone. |
| tourism | event | `resilience.crisis.declared.v1` | critical | A crisis withdraws affected zones from every published itinerary. |
| life-care | event | `resilience.crisis.declared.v1` | critical | Care facilities are evacuation-priority sites with dependent occupants. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
