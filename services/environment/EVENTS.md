# EVENTS — Environmental Nervous System

Contracts live in `packages/contracts/src/events/environment.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `environment.air-quality.updated.v1`

Air quality at a station. Health, Education, Mobility and Tourism all react to it.

| Field | Type |
| --- | --- |
| `stationId` | `string` |
| `governorate` | `gov` |
| `location` | `geo` |
| `pm25` | `number` |
| `no2` | `number` |
| `airQualityIndex` | `number` |
| `observedAt` | `date` |

Consumed by: `safety-emergency`, `national-digital-twin`, `industrial-energy`, `smart-trade`, `food-water`, `health`, `education`, `talent`, `religious-heritage`, `digital-nervous-system`, `mobility-logistics`, `land`, `tourism`, `culture`

### `environment.water-quality.updated.v1`

Water quality at a station.

| Field | Type |
| --- | --- |
| `stationId` | `string` |
| `governorate` | `gov` |
| `turbidityNtu` | `number` |
| `salinityGl` | `number` |
| `potable` | `bool` |
| `observedAt` | `date` |

Consumed by: `justice`, `food-water`, `health`, `infrastructure`, `tourism`

### `environment.climate-risk.updated.v1`

Climate risk for a zone: drought, heat, flood.

| Field | Type |
| --- | --- |
| `governorate` | `gov` |
| `droughtIndex` | `unit` |
| `heatRisk` | `unit` |
| `floodRisk` | `unit` |
| `horizonMonths` | `int` |
| `updatedAt` | `date` |

Consumed by: `resilience`, `national-digital-twin`, `industrial-energy`, `food-water`, `health`, `research`, `talent`, `religious-heritage`, `mobility-logistics`, `infrastructure`, `land`, `tourism`, `life-care`, `culture`

### `environment.waste-stream.updated.v1`

A waste stream volume or composition changed.

| Field | Type |
| --- | --- |
| `streamId` | `string` |
| `governorate` | `gov` |
| `material` | `string` |
| `tonnesPerYear` | `number` |
| `recoverable` | `unit` |
| `updatedAt` | `date` |

Consumed by: `industrial-energy`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Air, water, noise and weather observations ARE the environmental network. |
| `industry.production.updated.v1` | industrial-energy | critical | Industrial output is the main attributable source of emissions. |
| `energy.grid-load.updated.v1` | industrial-energy | normal | Generation mix decides the emission intensity of every kilowatt-hour. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | critical | Traffic is the second attributable source of urban air pollution. |
| `transport.congestion.detected.v1` | mobility-logistics | normal | Congestion multiplies emissions per kilometre travelled. |
| `agriculture.water-demand.predicted.v1` | food-water | critical | Abstraction is the largest pressure on the water balance. |
| `water.reservoir-level.updated.v1` | food-water | critical | Reservoir levels are the observable half of the drought index. |
| `infrastructure.failure.predicted.v1` | infrastructure | normal | Sewage and network failures are pollution events waiting to happen. |
| `emergency.incident.created.v1` | safety-emergency | critical | Industrial and fire incidents are acute pollution events. |
| `trade.product-passport.issued.v1` | smart-trade | normal | Product footprints and the national inventory must reconcile. |
| `tourism.site-pressure.detected.v1` | tourism | normal | Concentrated visitors are a local environmental pressure. |
| `land.zoning.changed.v1` | land | normal | Land-use change is the slowest and largest environmental driver. |
| `resilience.crisis.declared.v1` | resilience | normal | Crisis mode raises sampling frequency in the affected zone. |
| `research.finding.released.v1` | research | normal | Measurement and modelling results are adopted by the climate twin. |
| `culture.event.scheduled.v1` | culture | normal | Large events produce a measurable, plannable waste stream. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
