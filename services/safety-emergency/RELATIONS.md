# RELATIONS — National Safety & Emergency Grid

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**19 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `environment` · `food-water` · `health` · `industrial-energy` · `infrastructure` · `justice` · `land` · `life-care` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `resilience` · `social-mobility` · `talent` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| health | event | `health.capacity.updated.v1` | critical | Dispatch sends casualties to the nearest facility that can actually receive them. |
| health | event | `health.emergency.declared.v1` | critical | A health emergency needs civil protection resources Health does not own. |
| mobility-logistics | event | `transport.congestion.detected.v1` | critical | Congestion changes response time more than distance does. |
| environment | event | `environment.air-quality.updated.v1` | normal | Air quality drives both road risk and the protection level responders need. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Traffic, rainfall and vibration observations feed continuous road-risk scoring. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | critical | A failing bridge is a road-risk input and a route exclusion at the same time. |
| food-water | event | `water.reservoir-level.updated.v1` | normal | Reservoir state is a flood precursor for downstream zones. |
| industrial-energy | event | `industry.production.updated.v1` | normal | Industrial activity localises the risk of industrial incidents. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Under a declared crisis the grid switches to crisis dispatch rules. |
| culture | event | `culture.event.scheduled.v1` | normal | A scheduled gathering changes both crowd risk and the resources to pre-position. |
| tourism | event | `tourism.visitor-flow.updated.v1` | normal | Visitor volume changes how many people are in a zone at a given hour. |
| talent | event | `talent.facility-usage.updated.v1` | normal | Stadium and gymnasium usage is crowd exposure. |
| education | event | `education.school-condition.updated.v1` | normal | School condition and occupancy shape the response to a building incident. |
| social-mobility | event | `social.vulnerability.updated.v1` | normal | Vulnerable cohorts need a different response, not the same one faster. |
| mobility-logistics | api | `POST /dispatch` | critical | Every ambulance, truck and boat belongs to Transport; dispatch is a call, not a database write. |
| health | api | `GET /capacity` | critical | Triage decides a destination facility, which requires live capacity. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `emergency.incident.created.v1` | normal | A serious incident becomes a case file; opening it from the incident removes a manual re-entry step. |
| resilience | event | `emergency.incident.created.v1` | critical | Clustered incidents are how a crisis is first detected, before anyone declares one. |
| treasury | event | `emergency.incident.resolved.v1` | normal | Resolved incidents give the actual cost of response, not the estimate. |
| national-digital-twin | event | `emergency.incident.created.v1` | normal | Incident density is a fast indicator against a slow model. |
| social-mobility | event | `emergency.incident.created.v1` | normal | Repeated incidents in a zone are a vulnerability signal. |
| health | event | `emergency.incident.created.v1` | critical | Incoming casualties are known from the incident, before they arrive. |
| talent | event | `emergency.incident.created.v1` | normal | Crowd incidents at venues change facility operating rules. |
| religious-heritage | event | `emergency.incident.created.v1` | normal | Fire and structural incidents at sites need an immediate, specific response. |
| digital-nervous-system | event | `emergency.incident.created.v1` | normal | Incidents localise where edge capacity must be reinforced. |
| mobility-logistics | event | `emergency.incident.created.v1` | critical | An incident closes lanes and pulls resources; both are mobility facts. |
| mobility-logistics | event | `emergency.resource.requested.v1` | critical | Emergency resource requests are dispatch orders for Transport. |
| infrastructure | event | `emergency.incident.created.v1` | critical | Incidents on an asset are the strongest evidence its health index is wrong. |
| land | event | `emergency.incident.created.v1` | normal | Repeated incidents on a parcel are a siting constraint. |
| environment | event | `emergency.incident.created.v1` | critical | Industrial and fire incidents are acute pollution events. |
| tourism | event | `emergency.incident.created.v1` | critical | An incident at or near a site suspends recommendations for it. |
| life-care | event | `emergency.incident.created.v1` | normal | An incident affecting a household is a care trigger. |
| culture | event | `emergency.incident.created.v1` | critical | Fire or flood at a cultural asset is irreversible; response must be immediate. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
