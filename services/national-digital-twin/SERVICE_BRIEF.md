# SERVICE BRIEF — Tunisia National Digital Twin

**Ministry:** Planning / Prime Ministry
**Service id:** `national-digital-twin`
**Base path:** `/api/national-digital-twin`

## What this ministry is for

Hold the whole picture without owning anyone else data: aggregate references and signals, run scenarios across them, and hand every ministry back the context it cannot see alone.

## The three modules

### 1. Tunisia Digital Twin

Regional state assembled from every ministry signal.

`src/modules/tunisia-digital-twin.ts`

### 2. National Scenario Engine

What-if simulation across sectors.

`src/modules/national-scenario-engine.ts`

### 3. Regional AI Planner

Investment and priority proposals per governorate.

`src/modules/regional-ai-planner.ts`

## What it owns

Authoritative for: `RegionStateRef`, `ScenarioRef`.

Its own database namespace is `.data/national-digital-twin.json`, holding the
`regionStates` collection (24 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                                |
| ------------ | --------------------------------------------------------------------------------------------- |
| AI           | cross-sector scenario simulation · multivariate anomaly detection · regional priority ranking |
| IoT          | every sensor kind, as aggregate references                                                    |
| Digital twin | 24 governorate twins · national composite twin                                                |

## Connectivity

22 partner ministries. See `RELATIONS.md`.
