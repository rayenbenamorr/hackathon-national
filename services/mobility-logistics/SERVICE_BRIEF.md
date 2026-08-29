# SERVICE BRIEF — Autonomous Mobility & Logistics Grid

**Ministry:** Transport
**Service id:** `mobility-logistics`
**Base path:** `/api/mobility-logistics`

## What this ministry is for

Answer one question faster than anyone else in the country: what is the closest available resource, and how long until it arrives.

## The three modules

### 1. National Mobility Digital Twin

Flows, congestion and demand by corridor.

`src/modules/national-mobility-digital-twin.ts`

### 2. V2X Smart Road Grid

Road-side signals and vehicle-to-infrastructure messages.

`src/modules/v2x-smart-road-grid.ts`

### 3. Autonomous Logistics Brain

Freight planning and resource dispatch.

`src/modules/autonomous-logistics-brain.ts`

## What it owns

Authoritative for: `TransportResourceRef`, `RouteRef`, `FreightOrderRef`, `MobilityFlow`.

Its own database namespace is `.data/mobility-logistics.json`, holding the
`resources` collection (60 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                            |
| ------------ | ------------------------------------------------------------------------- |
| AI           | demand forecasting · dispatch optimisation · congestion cause attribution |
| IoT          | traffic flow · GPS position · air quality · noise                         |
| Digital twin | corridor twin · vehicle twin                                              |

## Connectivity

19 partner ministries. See `RELATIONS.md`.
