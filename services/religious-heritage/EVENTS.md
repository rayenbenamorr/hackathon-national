# EVENTS — Smart Religious Heritage Network

Contracts live in `packages/contracts/src/events/religious-heritage.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `heritage.site-condition.updated.v1`

Condition of a heritage site changed.

| Field | Type |
| --- | --- |
| `siteId` | `string` |
| `governorate` | `gov` |
| `conditionIndex` | `unit` |
| `humidityPct` | `number` |
| `vibrationMmS` | `number` |
| `observedAt` | `date` |

Consumed by: `infrastructure`, `tourism`, `culture`

### `heritage.energy-usage.updated.v1`

Energy consumption at a site.

| Field | Type |
| --- | --- |
| `siteId` | `string` |
| `governorate` | `gov` |
| `energyKwhMonth` | `number` |
| `renewableShare` | `unit` |
| `observedAt` | `date` |

Consumed by: _nobody yet_

### `heritage.knowledge.published.v1`

A sourced knowledge entry was published.

| Field | Type |
| --- | --- |
| `entryId` | `string` |
| `title` | `string` |
| `sourceCount` | `int` |
| `domain` | `string` |
| `publishedAt` | `date` |

Consumed by: _nobody yet_


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Humidity, vibration and strain observations are the site condition twin. |
| `environment.air-quality.updated.v1` | environment | critical | Particulates and pollutants are the main slow destroyer of historic fabric. |
| `environment.climate-risk.updated.v1` | environment | critical | Humidity and flood risk decide conservation priority. |
| `infrastructure.failure.predicted.v1` | infrastructure | critical | Historic buildings are infrastructure assets with irreplaceable value. |
| `infrastructure.maintenance.scheduled.v1` | infrastructure | normal | Conservation work is scheduled through the same maintenance system. |
| `energy.grid-load.updated.v1` | industrial-energy | normal | Site energy systems are optimised against the local grid. |
| `culture.asset-condition.updated.v1` | culture | critical | Many sites are both religious and cultural assets; conditions must agree. |
| `tourism.visitor-flow.updated.v1` | tourism | critical | Visitor pressure is the fastest controllable driver of degradation. |
| `tourism.site-pressure.detected.v1` | tourism | critical | Over-capacity is the signal that access must be regulated. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | normal | Access flows around historic quarters are a conservation variable. |
| `research.finding.released.v1` | research | normal | Conservation science results are adopted directly by the sensor network. |
| `emergency.incident.created.v1` | safety-emergency | normal | Fire and structural incidents at sites need an immediate, specific response. |
| `treasury.funding.approved.v1` | treasury | normal | Restoration programmes exist only once funded. |
| `education.program.updated.v1` | education | normal | Heritage education programmes are built on the knowledge graph. |
| `resilience.crisis.declared.v1` | resilience | critical | Historic sites are protection and evacuation priorities the moment a crisis is declared. |
| `land.zoning.changed.v1` | land | normal | What may be built next to a protected site is decided by zoning around it. |
| `social.vulnerability.updated.v1` | social-mobility | normal | Zaouias and madrasas remain community services in the most fragile neighbourhoods. |
| `twin.state.updated.v1` | national-digital-twin | normal | Regional state orders the conservation queue between governorates. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
