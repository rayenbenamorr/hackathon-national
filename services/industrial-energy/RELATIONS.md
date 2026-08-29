# RELATIONS — Industrial & Energy Intelligence Grid

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**19 partner ministries** out of 23 (target: 14).
`digital-nervous-system` · `education` · `environment` · `food-water` · `global-tunisia` · `health` · `infrastructure` · `land` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `research` · `resilience` · `safety-emergency` · `skills-opportunity` · `smart-trade` · `social-mobility` · `talent` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| environment | event | `environment.air-quality.updated.v1` | critical | Emissions constrain production; the plant twin must see its own consequence. |
| environment | event | `environment.waste-stream.updated.v1` | critical | Waste streams are the raw material of the symbiosis engine. |
| environment | event | `environment.climate-risk.updated.v1` | normal | Heat risk changes both demand and generation capacity. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Energy load and vibration observations are the grid and asset twins. |
| food-water | event | `agriculture.water-demand.predicted.v1` | critical | Industry and agriculture compete for the same water and the same pumping energy. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | critical | A predicted power-line failure is an outage risk before it is a maintenance order. |
| mobility-logistics | event | `logistics.freight.updated.v1` | normal | Freight movement is the physical trace of industrial output. |
| smart-trade | event | `trade.supply-risk.flagged.v1` | critical | An input dependency at risk stops a production line. |
| treasury | event | `treasury.funding.approved.v1` | normal | Industrial and renewable programmes move with approved funding. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Crisis load-shedding priorities are set from the declaration. |
| research | event | `research.finding.released.v1` | normal | Process and materials results are adopted first by industry. |
| skills-opportunity | event | `skills.gap.detected.v1` | normal | Operator and maintenance shortages cap what the grid can safely run. |
| land | event | `land.site-suitability.scored.v1` | normal | Renewable siting is a land question before it is an energy question. |
| national-digital-twin | event | `twin.scenario.completed.v1` | normal | Scenario outcomes set the demand assumptions the grid plans against. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| resilience | event | `energy.outage-risk.flagged.v1` | normal | Power shortfall determines which shelters and hospitals need generators. |
| safety-emergency | event | `industry.production.updated.v1` | normal | Industrial activity localises the risk of industrial incidents. |
| global-tunisia | event | `industry.production.updated.v1` | normal | Diaspora investment targets specific industrial sectors, not the country in the abstract. |
| treasury | event | `energy.outage-risk.flagged.v1` | normal | Outage risk carries a subsidy and compensation exposure. |
| national-digital-twin | event | `energy.grid-load.updated.v1` | critical | Energy load is a component of regional economic activity. |
| social-mobility | event | `energy.outage-risk.flagged.v1` | normal | Energy insecurity is one of the fastest drivers of household vulnerability. |
| smart-trade | event | `industry.production.updated.v1` | critical | The supply graph is built from what plants actually produce. |
| food-water | event | `energy.outage-risk.flagged.v1` | critical | Irrigation is pumping; no power is no irrigation. |
| skills-opportunity | event | `industry.production.updated.v1` | critical | Industrial activity is the largest single source of skill demand. |
| health | event | `energy.outage-risk.flagged.v1` | critical | An ICU without power is an evacuation, planned in advance or not at all. |
| education | event | `industry.production.updated.v1` | normal | Local industry defines which vocational tracks have a local outlet. |
| research | event | `industry.symbiosis.matched.v1` | normal | Symbiosis matches are process research made concrete. |
| talent | event | `energy.grid-load.updated.v1` | normal | Facility energy use is measured against the grid it sits on. |
| religious-heritage | event | `energy.grid-load.updated.v1` | normal | Site energy systems are optimised against the local grid. |
| digital-nervous-system | event | `energy.grid-load.updated.v1` | critical | An edge node without power is an edge node that is gone. |
| infrastructure | event | `energy.grid-load.updated.v1` | critical | Power lines and substations are infrastructure assets under electrical load. |
| land | event | `industry.production.updated.v1` | normal | Industrial activity defines the real use of industrial zoning. |
| environment | event | `industry.production.updated.v1` | critical | Industrial output is the main attributable source of emissions. |
| environment | event | `energy.grid-load.updated.v1` | normal | Generation mix decides the emission intensity of every kilowatt-hour. |
| environment | api | `GET /grid/load` | normal | Live generation mix when a climate projection is computed on demand. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
