# SERVICE BRIEF — Life & Care Intelligence OS

**Ministry:** Family, Women, Childhood & Seniors
**Service id:** `life-care`
**Base path:** `/api/life-care`

## What this ministry is for

Follow a life journey across the ministries that touch it, so that support arrives at the transition instead of after it.

## The three modules

### 1. Life Journey AI

Life events and the support each one should trigger.

`src/modules/life-journey-ai.ts`

### 2. Smart Care Network

Care facilities, capacity and coverage.

`src/modules/smart-care-network.ts`

### 3. Economic Independence Engine

The concrete path from support to autonomy.

`src/modules/economic-independence-engine.ts`

## What it owns

Authoritative for: `CareCohortRef`, `CareFacilityRef`, `LifeEventRef`.

Its own database namespace is `.data/life-care.json`, holding the
`facilities` collection (32 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                        |
| ------------ | ------------------------------------------------------------------------------------- |
| AI           | life-event to support inference · independence path planning · coverage gap detection |
| IoT          | occupancy · temperature · wearable heart rate                                         |
| Digital twin | care facility twin · life cohort twin                                                 |

## Connectivity

14 partner ministries. See `RELATIONS.md`.
