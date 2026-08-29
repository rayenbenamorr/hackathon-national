# SERVICE BRIEF — Smart Religious Heritage Network

**Ministry:** Religious Affairs
**Service id:** `religious-heritage`
**Base path:** `/api/religious-heritage`

## What this ministry is for

Protect fragile places with sensors instead of inspections, and answer questions about heritage from documented sources only.

## The three modules

### 1. Smart Heritage Sensor Network

Humidity, strain and vibration on fragile fabric.

`src/modules/smart-heritage-sensor-network.ts`

### 2. Smart Building / Energy System

Consumption and comfort in places of worship.

`src/modules/smart-building-energy-system.ts`

### 3. Trusted Knowledge Graph

Sourced, verifiable knowledge — never generated assertion.

`src/modules/trusted-knowledge-graph.ts`

## What it owns

Authoritative for: `HeritageSiteRef`, `ManuscriptRef`.

Its own database namespace is `.data/religious-heritage.json`, holding the
`sites` collection (28 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                           |
| ------------ | ------------------------------------------------------------------------ |
| AI           | sourced RAG with refusal · degradation forecasting · energy optimisation |
| IoT          | humidity · vibration · structural strain · occupancy · energy load       |
| Digital twin | site twin · building energy twin                                         |

## Connectivity

15 partner ministries. See `RELATIONS.md`.
