# SERVICE BRIEF — Autonomous Food & Water Grid

**Ministry:** Agriculture & Water Resources
**Service id:** `food-water`
**Base path:** `/api/food-water`

## What this ministry is for

Turn water from a resource that is discovered to be missing into a resource that is forecast — and make that forecast reach the ministries whose plans depend on it.

## The three modules

### 1. Autonomous Water Grid

Reservoirs, networks and demand as one balance.

`src/modules/autonomous-water-grid.ts`

### 2. AI Farm Digital Twin

Soil, crop and irrigation state per farm.

`src/modules/ai-farm-digital-twin.ts`

### 3. Smart Ocean & Fisheries Network

Stock and effort per fishing zone.

`src/modules/smart-ocean-fisheries-network.ts`

## What it owns

Authoritative for: `FarmRef`, `WaterAssetRef`, `FishingZoneRef`.

Its own database namespace is `.data/food-water.json`, holding the
`farms` collection (44 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 5 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                               |
| ------------ | -------------------------------------------------------------------------------------------- |
| AI           | water demand forecasting · shortage prediction · yield forecasting · irrigation optimisation |
| IoT          | soil moisture · water level · rainfall · temperature · humidity                              |
| Digital twin | farm twin · reservoir twin · fishing zone twin                                               |

## Connectivity

15 partner ministries. See `RELATIONS.md`.
