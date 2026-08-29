# SERVICE BRIEF — National Talent Intelligence Network

**Ministry:** Youth & Sports
**Service id:** `talent`
**Base path:** `/api/talent`

## What this ministry is for

Find talent where the facilities and the data already are, and stop losing athletes to injuries and gaps nobody was watching.

## The three modules

### 1. Athlete Digital Twin

Load, performance and injury risk from wearable signals.

`src/modules/athlete-digital-twin.ts`

### 2. Smart Sports Infrastructure Grid

Facility usage, condition and energy.

`src/modules/smart-sports-infrastructure-grid.ts`

### 3. Youth Opportunity AI

Connects young people to missions, training and clubs.

`src/modules/youth-opportunity-ai.ts`

## What it owns

Authoritative for: `AthleteCohortRef`, `SportsFacilityRef`.

Its own database namespace is `.data/talent.json`, holding the
`facilities` collection (30 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                      |
| ------------ | ------------------------------------------------------------------- |
| AI           | injury risk from load · talent identification · facility allocation |
| IoT          | wearable heart rate · occupancy · energy load · temperature         |
| Digital twin | athlete cohort twin · facility twin                                 |

## Connectivity

15 partner ministries. See `RELATIONS.md`.
