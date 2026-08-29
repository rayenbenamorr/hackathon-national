# EVENTS — Smart Infrastructure OS

Contracts live in `packages/contracts/src/events/infrastructure.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `infrastructure.asset-health.updated.v1`

Health index of an asset changed.

| Field | Type |
| --- | --- |
| `assetId` | `string` |
| `assetType` | `string` |
| `governorate` | `gov` |
| `healthIndex` | `unit` |
| `criticality` | `string` |
| `observedAt` | `date` |

Consumed by: `national-digital-twin`, `social-mobility`, `smart-trade`, `education`, `talent`, `digital-nervous-system`, `land`, `tourism`

### `infrastructure.failure.predicted.v1`

An asset is predicted to fail within a horizon.

| Field | Type |
| --- | --- |
| `predictionId` | `string` |
| `assetId` | `string` |
| `assetType` | `string` |
| `governorate` | `gov` |
| `horizonDays` | `int` |
| `probability` | `unit` |
| `consequence` | `text` |
| `predictedAt` | `date` |

Consumed by: `resilience`, `safety-emergency`, `treasury`, `industrial-energy`, `food-water`, `education`, `research`, `religious-heritage`, `mobility-logistics`, `environment`, `culture`

### `infrastructure.maintenance.scheduled.v1`

A work order was scheduled.

| Field | Type |
| --- | --- |
| `orderId` | `string` |
| `assetId` | `string` |
| `governorate` | `gov` |
| `scheduledFor` | `date` |
| `estimatedCostTnd` | `number` |
| `priority` | `enum:low|standard|high|emergency` |

Consumed by: `treasury`, `skills-opportunity`, `religious-heritage`, `mobility-logistics`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `iot.sensor.observation.v1` | digital-nervous-system | critical | Vibration, strain and water-level observations are the asset health index. |
| `environment.climate-risk.updated.v1` | environment | critical | Flood and heat risk are the dominant accelerators of asset degradation. |
| `environment.water-quality.updated.v1` | environment | normal | Water chemistry drives corrosion in networks and structures. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | critical | Load is what wears a road; demand is the load. |
| `transport.congestion.detected.v1` | mobility-logistics | normal | Chronic congestion marks the segments that fail first. |
| `emergency.incident.created.v1` | safety-emergency | critical | Incidents on an asset are the strongest evidence its health index is wrong. |
| `energy.grid-load.updated.v1` | industrial-energy | critical | Power lines and substations are infrastructure assets under electrical load. |
| `agriculture.water-demand.predicted.v1` | food-water | critical | Water networks are sized and stressed by demand. |
| `treasury.funding.approved.v1` | treasury | critical | A maintenance order without funding is a wish. |
| `resilience.crisis.declared.v1` | resilience | critical | Crisis reprioritises maintenance towards what the response depends on. |
| `land.zoning.changed.v1` | land | normal | New zoning creates infrastructure obligations before it creates buildings. |
| `education.school-condition.updated.v1` | education | normal | School buildings are part of the public asset base. |
| `health.capacity.updated.v1` | health | normal | Hospitals are critical assets; their continuity sets maintenance priority. |
| `heritage.site-condition.updated.v1` | religious-heritage | normal | Historic structures need maintenance rules of their own, from the same system. |
| `tourism.site-pressure.detected.v1` | tourism | normal | Visitor load is structural load on stairs, walkways and quays. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
