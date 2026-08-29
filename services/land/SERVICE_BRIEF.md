# SERVICE BRIEF — National Land Intelligence System

**Ministry:** State Property & Land Affairs
**Service id:** `land`
**Base path:** `/api/land`

## What this ministry is for

Answer "can this be built here, and should it" with evidence from every other ministry rather than with a map alone.

## The three modules

### 1. Tunisia Land Digital Twin

Parcels, zoning and current use.

`src/modules/tunisia-land-digital-twin.ts`

### 2. AI Site Planner

Multi-criteria site suitability scoring.

`src/modules/ai-site-planner.ts`

### 3. Public Asset Intelligence

What the State owns and whether it is used.

`src/modules/public-asset-intelligence.ts`

## What it owns

Authoritative for: `LandParcelRef`, `PublicAssetRef`, `ZoningRuleRef`.

Its own database namespace is `.data/land.json`, holding the
`parcels` collection (50 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                             |
| ------------ | -------------------------------------------------------------------------- |
| AI           | multi-criteria siting · zoning conflict detection · unused asset detection |
| IoT          | soil moisture · water level · structural strain                            |
| Digital twin | parcel twin · public asset twin                                            |

## Connectivity

18 partner ministries. See `RELATIONS.md`.
