# RELATIONS — Autonomous Food & Water Grid

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**15 partner ministries** out of 23 (target: 14).
`digital-nervous-system` · `environment` · `health` · `industrial-energy` · `infrastructure` · `land` · `mobility-logistics` · `national-digital-twin` · `research` · `resilience` · `safety-emergency` · `skills-opportunity` · `smart-trade` · `social-mobility` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| environment | event | `environment.climate-risk.updated.v1` | critical | Drought index is the dominant term in every water demand forecast. |
| environment | event | `environment.water-quality.updated.v1` | critical | Unusable water is not supply; quality belongs in the balance. |
| environment | event | `environment.air-quality.updated.v1` | normal | Heat and particulate load affect evapotranspiration and crop stress. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Soil moisture, rainfall and reservoir level are the farm and water twins. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | critical | A failing water network turns available water into unavailable water. |
| industrial-energy | event | `energy.outage-risk.flagged.v1` | critical | Irrigation is pumping; no power is no irrigation. |
| land | event | `land.parcel.updated.v1` | normal | Farm boundaries and areas come from the land register. |
| land | event | `land.zoning.changed.v1` | normal | Agricultural land converted to another use leaves the water demand model. |
| treasury | event | `treasury.funding.approved.v1` | normal | Irrigation programmes and compensation move with approved funding. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Under drought crisis the grid switches to allocation rather than demand-following. |
| smart-trade | event | `trade.export-opportunity.detected.v1` | normal | Export demand changes which crops are worth the water. |
| research | event | `research.finding.released.v1` | normal | Agronomy and water results are adopted directly by the farm twin. |
| health | event | `health.epidemic-signal.detected.v1` | normal | Water-borne health signals point back at a water asset. |
| national-digital-twin | event | `twin.state.updated.v1` | normal | Regional state gives the demand context a single farm cannot see. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| resilience | event | `agriculture.water-shortage.predicted.v1` | critical | A predicted water shortage is a slow-onset crisis; declaring early is the whole point. |
| safety-emergency | event | `water.reservoir-level.updated.v1` | normal | Reservoir state is a flood precursor for downstream zones. |
| treasury | event | `agriculture.water-shortage.predicted.v1` | critical | Water shortage has a known fiscal shape: compensation, tankering, import. |
| national-digital-twin | event | `agriculture.water-demand.predicted.v1` | critical | Water demand versus supply is the axis that moves every other one. |
| national-digital-twin | event | `agriculture.water-shortage.predicted.v1` | critical | A shortage prediction propagates into health, economy and mobility in the model. |
| social-mobility | event | `agriculture.water-shortage.predicted.v1` | critical | Water shortage translates directly into household need in rural cohorts. |
| industrial-energy | event | `agriculture.water-demand.predicted.v1` | critical | Industry and agriculture compete for the same water and the same pumping energy. |
| smart-trade | event | `agriculture.yield.forecast.v1` | critical | Exportable volume of olive oil, dates and cereals is a yield forecast first. |
| smart-trade | event | `fisheries.stock.updated.v1` | normal | Seafood export capacity follows stock and effort. |
| skills-opportunity | event | `agriculture.yield.forecast.v1` | normal | Agricultural seasons drive predictable seasonal skill demand. |
| health | event | `agriculture.water-shortage.predicted.v1` | normal | Water shortage has a documented health consequence within weeks. |
| research | event | `agriculture.water-shortage.predicted.v1` | critical | Water scarcity is the most funded applied research question in the country. |
| digital-nervous-system | event | `water.reservoir-level.updated.v1` | normal | Confirms that water sensors registered here are producing usable values. |
| mobility-logistics | event | `agriculture.yield.forecast.v1` | normal | Harvest volumes are freight demand with a season. |
| infrastructure | event | `agriculture.water-demand.predicted.v1` | critical | Water networks are sized and stressed by demand. |
| land | event | `agriculture.water-demand.predicted.v1` | critical | Water availability decides whether agricultural zoning is viable. |
| land | event | `agriculture.water-shortage.predicted.v1` | critical | A shortage forecast should freeze water-intensive siting decisions. |
| land | api | `GET /irrigation/plan` | normal | Water plans are read directly when an agricultural site is evaluated. |
| environment | event | `agriculture.water-demand.predicted.v1` | critical | Abstraction is the largest pressure on the water balance. |
| environment | event | `water.reservoir-level.updated.v1` | critical | Reservoir levels are the observable half of the drought index. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
