# SERVICE BRIEF — Tunisia Immersive Tourism OS

**Ministry:** Tourism
**Service id:** `tourism`
**Base path:** `/api/tourism`

## What this ministry is for

Spread visitors instead of concentrating them, using signals the country already produces — and protect the sites that make the visit worth it.

## The three modules

### 1. Tourism Digital Twin

Site capacity, pressure and seasonality.

`src/modules/tourism-digital-twin.ts`

### 2. AR Tunisia

Anchored augmented-reality scenes at real sites.

`src/modules/ar-tunisia.ts`

### 3. AI Tourism Flow Engine

Itineraries that redistribute pressure.

`src/modules/ai-tourism-flow-engine.ts`

## What it owns

Authoritative for: `TourismAssetRef`, `VisitorFlowRef`, `ARSceneRef`.

Its own database namespace is `.data/tourism.json`, holding the
`sites` collection (36 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                            |
| ------------ | ------------------------------------------------------------------------- |
| AI           | itinerary generation · pressure forecasting · multilingual site narration |
| IoT          | occupancy · air quality · noise · temperature                             |
| Digital twin | site twin · visitor flow twin                                             |

## Connectivity

15 partner ministries. See `RELATIONS.md`.
