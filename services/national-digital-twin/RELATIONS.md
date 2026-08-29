# RELATIONS — Tunisia National Digital Twin

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**22 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `environment` · `food-water` · `global-tunisia` · `health` · `industrial-energy` · `infrastructure` · `justice` · `land` · `life-care` · `mobility-logistics` · `religious-heritage` · `research` · `resilience` · `safety-emergency` · `skills-opportunity` · `smart-trade` · `social-mobility` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| environment | event | `environment.air-quality.updated.v1` | critical | Air quality is one of the six axes of the regional state vector. |
| environment | event | `environment.climate-risk.updated.v1` | critical | Climate risk is the slow variable every scenario is run against. |
| food-water | event | `agriculture.water-demand.predicted.v1` | critical | Water demand versus supply is the axis that moves every other one. |
| food-water | event | `agriculture.water-shortage.predicted.v1` | critical | A shortage prediction propagates into health, economy and mobility in the model. |
| health | event | `health.capacity.updated.v1` | critical | Health load is a direct component of the regional stress index. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | critical | Mobility pressure is a component of the regional stress index. |
| industrial-energy | event | `energy.grid-load.updated.v1` | critical | Energy load is a component of regional economic activity. |
| infrastructure | event | `infrastructure.asset-health.updated.v1` | critical | Asset health bounds what any scenario can assume about capacity. |
| social-mobility | event | `social.vulnerability.updated.v1` | critical | Vulnerability is what makes the same shock a different event in two governorates. |
| safety-emergency | event | `emergency.incident.created.v1` | normal | Incident density is a fast indicator against a slow model. |
| resilience | event | `resilience.crisis.declared.v1` | critical | A declared crisis switches the twin into crisis mode for that zone. |
| education | event | `education.school-condition.updated.v1` | normal | School condition is a durable component of regional capability. |
| land | event | `land.zoning.changed.v1` | normal | Zoning is the lever most scenarios end up recommending. |
| tourism | event | `tourism.visitor-flow.updated.v1` | normal | Seasonal population is not resident population; the model needs both. |
| treasury | event | `treasury.fiscal-risk.flagged.v1` | normal | A fiscal constraint bounds which scenario outcomes are reachable. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Raw observations keep regional twins current between ministry publications. |
| smart-trade | event | `trade.shipment.updated.v1` | normal | Trade flows are the economic exchange term between regions. |
| skills-opportunity | event | `skills.gap.detected.v1` | normal | Skill availability limits what a regional plan can actually execute. |
| culture | event | `culture.creative-economy.updated.v1` | normal | Creative activity is a measurable part of regional economic activity. |
| life-care | event | `care.facility-capacity.updated.v1` | normal | Care coverage is part of the social axis of the region state. |
| health | api | `GET /capacity` | normal | Direct read when the twin needs current capacity rather than the last event. |
| environment | api | `GET /air-quality` | normal | Direct read for on-demand recomputation of a region state. |
| mobility-logistics | api | `GET /flows` | normal | Direct read of mobility pressure when a scenario is run interactively. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `twin.anomaly.detected.v1` | normal | A regional anomaly usually precedes a case surge in the same governorate. |
| justice | api | `GET /regions/stress` | normal | Regional stress explains case surges the court twin cannot see on its own. |
| resilience | event | `twin.anomaly.detected.v1` | normal | Multi-sector anomalies are early crisis signatures. |
| global-tunisia | event | `twin.state.updated.v1` | normal | Regional state is what the diaspora asks about before investing. |
| treasury | event | `twin.scenario.completed.v1` | critical | Scenario outcomes are costed before they are decided. |
| treasury | api | `GET /regions/stress` | normal | Regional stress is the allocation key the optimiser argues from. |
| industrial-energy | event | `twin.scenario.completed.v1` | normal | Scenario outcomes set the demand assumptions the grid plans against. |
| food-water | event | `twin.state.updated.v1` | normal | Regional state gives the demand context a single farm cannot see. |
| research | event | `twin.scenario.completed.v1` | normal | Scenario gaps are exactly where research is missing. |
| religious-heritage | event | `twin.state.updated.v1` | normal | Regional state orders the conservation queue between governorates. |
| digital-nervous-system | event | `twin.anomaly.detected.v1` | normal | An anomaly across sensors is often a fabric fault, not a real event. |
| land | event | `twin.scenario.completed.v1` | normal | Scenario outcomes are usually expressed as land decisions. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
