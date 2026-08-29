# SERVICE BRIEF — Tunisia Cultural Intelligence Network

**Ministry:** Culture
**Service id:** `culture`
**Base path:** `/api/culture`

## What this ministry is for

Make culture an infrastructure with a state — conserved, visited, funded — rather than a calendar of events.

## The three modules

### 1. Tunisia Cultural Digital Twin

Condition and use of every cultural asset.

`src/modules/tunisia-cultural-digital-twin.ts`

### 2. Immersive Tunisia

Digitised works and immersive access.

`src/modules/immersive-tunisia.ts`

### 3. Creative Economy AI Network

Creative activity, audience and revenue.

`src/modules/creative-economy-ai-network.ts`

## What it owns

Authoritative for: `CulturalAssetRef`, `CreativeWorkRef`, `CulturalEventRef`.

Its own database namespace is `.data/culture.json`, holding the
`assets` collection (38 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                          |
| ------------ | ----------------------------------------------------------------------- |
| AI           | condition forecasting · audience recommendation · archive summarisation |
| IoT          | humidity · temperature · occupancy · vibration                          |
| Digital twin | cultural asset twin · creative economy twin                             |

## Connectivity

16 partner ministries. See `RELATIONS.md`.
