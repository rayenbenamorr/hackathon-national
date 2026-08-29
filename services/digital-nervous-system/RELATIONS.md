# RELATIONS — Tunisia Digital Nervous System

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**19 partner ministries** out of 23 (target: 14).
`culture` · `education` · `environment` · `food-water` · `health` · `industrial-energy` · `infrastructure` · `justice` · `land` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `research` · `resilience` · `safety-emergency` · `smart-trade` · `talent` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| environment | event | `environment.air-quality.updated.v1` | normal | Station readings validate the fabric against an independent publication. |
| safety-emergency | event | `emergency.incident.created.v1` | normal | Incidents localise where edge capacity must be reinforced. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Crisis mode changes edge routing to store-and-forward. |
| resilience | event | `resilience.mesh-node.status.v1` | critical | Mesh nodes are edge nodes seen by the ministry that deploys them. |
| infrastructure | event | `infrastructure.asset-health.updated.v1` | critical | Telecom sites are infrastructure assets; their health is fabric health. |
| industrial-energy | event | `energy.grid-load.updated.v1` | critical | An edge node without power is an edge node that is gone. |
| mobility-logistics | event | `transport.resource.dispatched.v1` | normal | Moving resources carry sensors that join and leave the fabric. |
| food-water | event | `water.reservoir-level.updated.v1` | normal | Confirms that water sensors registered here are producing usable values. |
| health | event | `health.capacity.updated.v1` | normal | Facility connectivity is prioritised by criticality of the facility. |
| education | event | `education.school-condition.updated.v1` | normal | School connectivity is a fabric coverage question. |
| land | event | `land.parcel.updated.v1` | normal | Sensor and node siting is a land question. |
| research | event | `research.finding.released.v1` | normal | Edge inference and networking results are deployed on the fabric. |
| national-digital-twin | event | `twin.anomaly.detected.v1` | normal | An anomaly across sensors is often a fabric fault, not a real event. |
| treasury | event | `treasury.funding.approved.v1` | normal | Coverage extension programmes follow approved funding. |
| tourism | event | `tourism.site-pressure.detected.v1` | normal | Crowded sites are where public connectivity is most contested. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `iot.sensor.observation.v1` | normal | Courthouse occupancy sensors feed the court twin, so saturation is measured rather than asserted. |
| resilience | event | `iot.sensor.observation.v1` | critical | Water level, rainfall and wind observations drive early crisis detection. |
| safety-emergency | event | `iot.sensor.observation.v1` | critical | Traffic, rainfall and vibration observations feed continuous road-risk scoring. |
| national-digital-twin | event | `iot.sensor.observation.v1` | critical | Raw observations keep regional twins current between ministry publications. |
| industrial-energy | event | `iot.sensor.observation.v1` | critical | Energy load and vibration observations are the grid and asset twins. |
| smart-trade | event | `iot.sensor.observation.v1` | critical | Cold-chain temperature and container GPS observations are the shipment twin. |
| food-water | event | `iot.sensor.observation.v1` | critical | Soil moisture, rainfall and reservoir level are the farm and water twins. |
| health | event | `iot.sensor.observation.v1` | critical | Wearable and facility observations feed the cohort and hospital twins. |
| education | event | `iot.sensor.observation.v1` | critical | School air quality, occupancy and temperature are the school twin. |
| talent | event | `iot.sensor.observation.v1` | critical | Wearable and occupancy observations are the athlete and facility twins. |
| religious-heritage | event | `iot.sensor.observation.v1` | critical | Humidity, vibration and strain observations are the site condition twin. |
| mobility-logistics | event | `iot.sensor.observation.v1` | critical | Traffic flow and GPS observations are the mobility twin. |
| infrastructure | event | `iot.sensor.observation.v1` | critical | Vibration, strain and water-level observations are the asset health index. |
| environment | event | `iot.sensor.observation.v1` | critical | Air, water, noise and weather observations ARE the environmental network. |
| tourism | event | `iot.sensor.observation.v1` | critical | Occupancy and noise observations are the site pressure index. |
| culture | event | `iot.sensor.observation.v1` | critical | Humidity, temperature and vibration observations are the asset condition twin. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
