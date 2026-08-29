# RELATIONS — Environmental Nervous System

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**19 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `food-water` · `health` · `industrial-energy` · `infrastructure` · `justice` · `land` · `life-care` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `research` · `resilience` · `safety-emergency` · `smart-trade` · `talent` · `tourism`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Air, water, noise and weather observations ARE the environmental network. |
| industrial-energy | event | `industry.production.updated.v1` | critical | Industrial output is the main attributable source of emissions. |
| industrial-energy | event | `energy.grid-load.updated.v1` | normal | Generation mix decides the emission intensity of every kilowatt-hour. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | critical | Traffic is the second attributable source of urban air pollution. |
| mobility-logistics | event | `transport.congestion.detected.v1` | normal | Congestion multiplies emissions per kilometre travelled. |
| food-water | event | `agriculture.water-demand.predicted.v1` | critical | Abstraction is the largest pressure on the water balance. |
| food-water | event | `water.reservoir-level.updated.v1` | critical | Reservoir levels are the observable half of the drought index. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | normal | Sewage and network failures are pollution events waiting to happen. |
| safety-emergency | event | `emergency.incident.created.v1` | critical | Industrial and fire incidents are acute pollution events. |
| smart-trade | event | `trade.product-passport.issued.v1` | normal | Product footprints and the national inventory must reconcile. |
| tourism | event | `tourism.site-pressure.detected.v1` | normal | Concentrated visitors are a local environmental pressure. |
| land | event | `land.zoning.changed.v1` | normal | Land-use change is the slowest and largest environmental driver. |
| resilience | event | `resilience.crisis.declared.v1` | normal | Crisis mode raises sampling frequency in the affected zone. |
| research | event | `research.finding.released.v1` | normal | Measurement and modelling results are adopted by the climate twin. |
| culture | event | `culture.event.scheduled.v1` | normal | Large events produce a measurable, plannable waste stream. |
| industrial-energy | api | `GET /grid/load` | normal | Live generation mix when a climate projection is computed on demand. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `environment.water-quality.updated.v1` | normal | Environmental degradation records are evidence in environmental proceedings. |
| resilience | event | `environment.climate-risk.updated.v1` | critical | Drought, heat and flood risk are the leading indicators the command system watches. |
| safety-emergency | event | `environment.air-quality.updated.v1` | normal | Air quality drives both road risk and the protection level responders need. |
| national-digital-twin | event | `environment.air-quality.updated.v1` | critical | Air quality is one of the six axes of the regional state vector. |
| national-digital-twin | event | `environment.climate-risk.updated.v1` | critical | Climate risk is the slow variable every scenario is run against. |
| national-digital-twin | api | `GET /air-quality` | normal | Direct read for on-demand recomputation of a region state. |
| industrial-energy | event | `environment.air-quality.updated.v1` | critical | Emissions constrain production; the plant twin must see its own consequence. |
| industrial-energy | event | `environment.waste-stream.updated.v1` | critical | Waste streams are the raw material of the symbiosis engine. |
| industrial-energy | event | `environment.climate-risk.updated.v1` | normal | Heat risk changes both demand and generation capacity. |
| smart-trade | event | `environment.air-quality.updated.v1` | normal | Carbon and emission context feeds the product passport footprint. |
| food-water | event | `environment.climate-risk.updated.v1` | critical | Drought index is the dominant term in every water demand forecast. |
| food-water | event | `environment.water-quality.updated.v1` | critical | Unusable water is not supply; quality belongs in the balance. |
| food-water | event | `environment.air-quality.updated.v1` | normal | Heat and particulate load affect evapotranspiration and crop stress. |
| health | event | `environment.air-quality.updated.v1` | critical | Respiratory admissions follow particulate load with a short, known lag. |
| health | event | `environment.water-quality.updated.v1` | critical | Water-borne disease surveillance starts at the water station, not at the ward. |
| health | event | `environment.climate-risk.updated.v1` | normal | Heat risk is a direct predictor of emergency load in vulnerable cohorts. |
| health | api | `GET /air-quality` | normal | Live air quality when an epidemic scan is run on demand. |
| education | event | `environment.air-quality.updated.v1` | critical | Poor air in a school is a decision to take today, not a statistic. |
| research | event | `environment.climate-risk.updated.v1` | critical | Climate projections set the agenda of the living labs. |
| talent | event | `environment.air-quality.updated.v1` | critical | Outdoor training on a high-particulate day is a measurable injury and health risk. |
| talent | event | `environment.climate-risk.updated.v1` | normal | Heat risk decides whether a session is held at all. |
| religious-heritage | event | `environment.air-quality.updated.v1` | critical | Particulates and pollutants are the main slow destroyer of historic fabric. |
| religious-heritage | event | `environment.climate-risk.updated.v1` | critical | Humidity and flood risk decide conservation priority. |
| digital-nervous-system | event | `environment.air-quality.updated.v1` | normal | Station readings validate the fabric against an independent publication. |
| mobility-logistics | event | `environment.air-quality.updated.v1` | normal | Traffic is both a cause and a victim of poor air; both feed the corridor twin. |
| mobility-logistics | event | `environment.climate-risk.updated.v1` | normal | Flood and heat risk close corridors before any incident is reported. |
| mobility-logistics | api | `GET /air-quality` | normal | Air quality is read when a corridor plan is produced interactively. |
| infrastructure | event | `environment.climate-risk.updated.v1` | critical | Flood and heat risk are the dominant accelerators of asset degradation. |
| infrastructure | event | `environment.water-quality.updated.v1` | normal | Water chemistry drives corrosion in networks and structures. |
| land | event | `environment.climate-risk.updated.v1` | critical | Flood and drought risk are hard constraints on any siting score. |
| land | event | `environment.air-quality.updated.v1` | normal | Air quality is a constraint on residential and school siting. |
| tourism | event | `environment.air-quality.updated.v1` | critical | A bad air day is a bad visit; itineraries route around it. |
| tourism | event | `environment.water-quality.updated.v1` | critical | Bathing water quality decides whether a beach can be recommended at all. |
| tourism | event | `environment.climate-risk.updated.v1` | normal | Heat risk reshapes the summer offer towards inland and evening options. |
| tourism | api | `GET /air-quality` | critical | Air quality is read at itinerary build time, not from the last event. |
| life-care | event | `environment.climate-risk.updated.v1` | normal | Heat waves are a documented mortality risk for elderly cohorts. |
| culture | event | `environment.air-quality.updated.v1` | critical | Pollution is the slow destroyer of monuments and open-air sites. |
| culture | event | `environment.climate-risk.updated.v1` | critical | Flood and humidity risk set the conservation queue. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
