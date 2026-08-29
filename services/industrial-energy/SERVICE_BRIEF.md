# SERVICE BRIEF — Industrial & Energy Intelligence Grid

**Ministry:** Industry & Energy
**Service id:** `industrial-energy`
**Base path:** `/api/industrial-energy`

## What this ministry is for

Run industry and energy as one system: the grid knows what industry is about to do, and industry knows what the grid can afford.

## The three modules

### 1. Industrial Digital Twin Network

Twin per industrial asset: output, consumption, condition.

`src/modules/industrial-digital-twin-network.ts`

### 2. Energy Internet

Node-level load, generation and renewable share.

`src/modules/energy-internet.ts`

### 3. AI Industrial Symbiosis

Matches one plant output stream to another plant input.

`src/modules/ai-industrial-symbiosis.ts`

## What it owns

Authoritative for: `IndustrialAssetRef`, `EnergyNodeRef`, `SymbiosisMatchRef`.

Its own database namespace is `.data/industrial-energy.json`, holding the
`assets` collection (34 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                      |
| ------------ | ------------------------------------------------------------------- |
| AI           | load forecasting · symbiosis matching · equipment anomaly detection |
| IoT          | energy load · vibration · temperature · air quality                 |
| Digital twin | industrial asset twin · grid node twin                              |

## Connectivity

19 partner ministries. See `RELATIONS.md`.
