# SERVICE BRIEF — Environmental Nervous System

**Ministry:** Environment
**Service id:** `environment`
**Base path:** `/api/environment`

## What this ministry is for

Publish environmental truth continuously and early enough that other ministries can act on it rather than report it.

## The three modules

### 1. National Environmental Sensor Network

Air, water and noise observations everywhere.

`src/modules/national-environmental-sensor-network.ts`

### 2. Climate Digital Twin

Projections and climate risk per zone.

`src/modules/climate-digital-twin.ts`

### 3. Circular Resource AI

Waste streams and their possible reuse.

`src/modules/circular-resource-ai.ts`

## What it owns

Authoritative for: `EnvironmentalObservation`, `ClimateProjectionRef`, `WasteStreamRef`.

Its own database namespace is `.data/environment.json`, holding the
`stations` collection (40 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                       |
| ------------ | ------------------------------------------------------------------------------------ |
| AI           | pollution source attribution · climate projection · waste reuse matching             |
| IoT          | air quality · water quality · noise · temperature · humidity · rainfall · wind speed |
| Digital twin | station twin · climate zone twin                                                     |

## Connectivity

19 partner ministries. See `RELATIONS.md`.
