# EVENTS — Autonomous Food & Water Grid

Contracts live in `packages/contracts/src/events/food-water.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `agriculture.water-demand.predicted.v1`

Forecast water demand for a zone — the canonical cross-ministry forecast on this platform.

| Field | Type |
| --- | --- |
| `forecastId` | `string` |
| `governorate` | `gov` |
| `horizonDays` | `int` |
| `demandM3Day` | `number` |
| `confidence` | `unit` |
| `drivers` | `string[]` |
| `predictedAt` | `date` |

Consumed by: `national-digital-twin`, `industrial-energy`, `infrastructure`, `land`, `environment`

### `agriculture.water-shortage.predicted.v1`

A shortage is expected: demand will exceed available supply.

| Field | Type |
| --- | --- |
| `alertId` | `string` |
| `governorate` | `gov` |
| `horizonDays` | `int` |
| `deficitM3Day` | `number` |
| `severity` | `enum:watch|alert|critical` |
| `affectedFarms` | `int` |
| `predictedAt` | `date` |

Consumed by: `resilience`, `treasury`, `national-digital-twin`, `social-mobility`, `health`, `research`, `land`

### `agriculture.yield.forecast.v1`

Expected yield for a crop in a governorate.

| Field | Type |
| --- | --- |
| `forecastId` | `string` |
| `crop` | `string` |
| `governorate` | `gov` |
| `expectedTonnes` | `number` |
| `varianceFromBaseline` | `number` |
| `predictedAt` | `date` |

Consumed by: `smart-trade`, `skills-opportunity`, `mobility-logistics`

### `water.reservoir-level.updated.v1`

Reservoir fill level changed.

| Field | Type |
| --- | --- |
| `assetId` | `string` |
| `governorate` | `gov` |
| `fillPct` | `unit` |
| `volumeM3` | `number` |
| `trend` | `enum:rising|stable|falling` |
| `observedAt` | `date` |

Consumed by: `safety-emergency`, `digital-nervous-system`, `environment`

### `fisheries.stock.updated.v1`

Stock and fishing effort for a maritime zone.

| Field | Type |
| --- | --- |
| `zoneId` | `string` |
| `species` | `string` |
| `stockIndex` | `unit` |
| `effortBoats` | `int` |
| `observedAt` | `date` |

Consumed by: `smart-trade`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `environment.climate-risk.updated.v1` | environment | critical | Drought index is the dominant term in every water demand forecast. |
| `environment.water-quality.updated.v1` | environment | critical | Unusable water is not supply; quality belongs in the balance. |
| `environment.air-quality.updated.v1` | environment | normal | Heat and particulate load affect evapotranspiration and crop stress. |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Soil moisture, rainfall and reservoir level are the farm and water twins. |
| `infrastructure.failure.predicted.v1` | infrastructure | critical | A failing water network turns available water into unavailable water. |
| `energy.outage-risk.flagged.v1` | industrial-energy | critical | Irrigation is pumping; no power is no irrigation. |
| `land.parcel.updated.v1` | land | normal | Farm boundaries and areas come from the land register. |
| `land.zoning.changed.v1` | land | normal | Agricultural land converted to another use leaves the water demand model. |
| `treasury.funding.approved.v1` | treasury | normal | Irrigation programmes and compensation move with approved funding. |
| `resilience.crisis.declared.v1` | resilience | critical | Under drought crisis the grid switches to allocation rather than demand-following. |
| `trade.export-opportunity.detected.v1` | smart-trade | normal | Export demand changes which crops are worth the water. |
| `research.finding.released.v1` | research | normal | Agronomy and water results are adopted directly by the farm twin. |
| `health.epidemic-signal.detected.v1` | health | normal | Water-borne health signals point back at a water asset. |
| `twin.state.updated.v1` | national-digital-twin | normal | Regional state gives the demand context a single farm cannot see. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
