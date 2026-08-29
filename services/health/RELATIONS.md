# RELATIONS — Connected Health Intelligence System

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**20 partner ministries** out of 23 (target: 14).
`digital-nervous-system` · `education` · `environment` · `food-water` · `global-tunisia` · `industrial-energy` · `infrastructure` · `justice` · `life-care` · `mobility-logistics` · `national-digital-twin` · `research` · `resilience` · `safety-emergency` · `skills-opportunity` · `smart-trade` · `social-mobility` · `talent` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| environment | event | `environment.air-quality.updated.v1` | critical | Respiratory admissions follow particulate load with a short, known lag. |
| environment | event | `environment.water-quality.updated.v1` | critical | Water-borne disease surveillance starts at the water station, not at the ward. |
| environment | event | `environment.climate-risk.updated.v1` | normal | Heat risk is a direct predictor of emergency load in vulnerable cohorts. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Wearable and facility observations feed the cohort and hospital twins. |
| safety-emergency | event | `emergency.incident.created.v1` | critical | Incoming casualties are known from the incident, before they arrive. |
| mobility-logistics | event | `transport.resource.dispatched.v1` | critical | The hospital needs the ETA of what is coming to it. |
| social-mobility | event | `social.vulnerability.updated.v1` | critical | Vulnerable cohorts need outreach, not availability. |
| food-water | event | `agriculture.water-shortage.predicted.v1` | normal | Water shortage has a documented health consequence within weeks. |
| education | event | `education.school-condition.updated.v1` | normal | School air quality and crowding are paediatric health signals. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Crisis mode changes triage rules and capacity reporting frequency. |
| life-care | event | `care.facility-capacity.updated.v1` | critical | Discharge to a care facility is what frees a hospital bed. |
| industrial-energy | event | `energy.outage-risk.flagged.v1` | critical | An ICU without power is an evacuation, planned in advance or not at all. |
| tourism | event | `tourism.visitor-flow.updated.v1` | normal | Seasonal population changes the denominator of every capacity ratio. |
| talent | event | `talent.injury-risk.flagged.v1` | normal | Sports injury load is predictable and lands in the same emergency rooms. |
| mobility-logistics | api | `GET /resources/nearest` | critical | Inter-hospital transfer starts by finding the closest available ambulance. |
| environment | api | `GET /air-quality` | normal | Live air quality when an epidemic scan is run on demand. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `health.epidemic-signal.detected.v1` | normal | Hearing continuity plans depend on health restrictions in the governorate. |
| resilience | event | `health.capacity.updated.v1` | critical | A relief plan that ignores hospital saturation sends people where they cannot be treated. |
| resilience | api | `GET /capacity` | critical | Casualty routing needs live bed and ICU availability at plan time, not at event time. |
| safety-emergency | event | `health.capacity.updated.v1` | critical | Dispatch sends casualties to the nearest facility that can actually receive them. |
| safety-emergency | event | `health.emergency.declared.v1` | critical | A health emergency needs civil protection resources Health does not own. |
| safety-emergency | api | `GET /capacity` | critical | Triage decides a destination facility, which requires live capacity. |
| global-tunisia | event | `health.epidemic-signal.detected.v1` | normal | Travel advice to citizens abroad depends on the health situation at home. |
| treasury | event | `health.capacity.updated.v1` | normal | Saturation is the earliest signal of an unbudgeted health cost. |
| national-digital-twin | event | `health.capacity.updated.v1` | critical | Health load is a direct component of the regional stress index. |
| national-digital-twin | api | `GET /capacity` | normal | Direct read when the twin needs current capacity rather than the last event. |
| social-mobility | event | `health.capacity.updated.v1` | normal | Health access is a component of the vulnerability index. |
| social-mobility | event | `health.epidemic-signal.detected.v1` | normal | An epidemic signal changes which cohorts are exposed and how. |
| social-mobility | api | `GET /capacity` | normal | Eligibility for health-linked support checks live regional capacity. |
| smart-trade | event | `health.epidemic-signal.detected.v1` | normal | Food and pharmaceutical export controls follow health signals at the border. |
| food-water | event | `health.epidemic-signal.detected.v1` | normal | Water-borne health signals point back at a water asset. |
| skills-opportunity | event | `health.capacity.updated.v1` | normal | Chronic saturation is a health workforce gap, not only a bed gap. |
| education | event | `health.epidemic-signal.detected.v1` | critical | School closure and reopening decisions follow the health signal. |
| research | event | `health.epidemic-signal.detected.v1` | critical | An epidemic signal is a research trigger with a deadline. |
| talent | event | `health.capacity.updated.v1` | normal | Sports medicine capacity gates both competition and training volume. |
| talent | api | `GET /capacity` | normal | Live medical capacity is checked before a large event is confirmed. |
| digital-nervous-system | event | `health.capacity.updated.v1` | normal | Facility connectivity is prioritised by criticality of the facility. |
| mobility-logistics | event | `health.emergency.declared.v1` | critical | A health emergency is a transport mission with a clock. |
| mobility-logistics | event | `health.capacity.updated.v1` | critical | A resource is only correctly routed if the destination can receive it. |
| infrastructure | event | `health.capacity.updated.v1` | normal | Hospitals are critical assets; their continuity sets maintenance priority. |
| tourism | event | `health.capacity.updated.v1` | normal | Medical coverage is part of a responsible destination recommendation. |
| life-care | event | `health.capacity.updated.v1` | critical | Discharge planning is only possible if hospital pressure is visible. |
| life-care | event | `health.care-episode.updated.v1` | critical | A care episode ending is where the care network takes over. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
