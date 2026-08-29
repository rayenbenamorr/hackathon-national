# SERVICE BRIEF — Global Tunisia Network

**Ministry:** Foreign Affairs
**Service id:** `global-tunisia`
**Base path:** `/api/global-tunisia`

## What this ministry is for

Treat Tunisians abroad as a connected part of the national system — a source of skills, investment and demand, not a mailing list.

## The three modules

### 1. Diaspora Intelligence Graph

Aggregate, privacy-safe picture of skills and presence abroad.

`src/modules/diaspora-intelligence-graph.ts`

### 2. AI Consular Twin

Consular demand and processing time per post.

`src/modules/ai-consular-twin.ts`

### 3. Global Opportunity Engine

Matches opportunities at home to capabilities abroad.

`src/modules/global-opportunity-engine.ts`

## What it owns

Authoritative for: `DiasporaCohortRef`, `ConsulateRef`, `GlobalOpportunityRef`.

Its own database namespace is `.data/global-tunisia.json`, holding the
`consulates` collection (16 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------ |
| AI           | skill-to-opportunity matching · consular demand forecasting · multilingual request summarisation |
| IoT          | consular queue occupancy                                                                         |
| Digital twin | consular post twin · country cohort twin                                                         |

## Connectivity

15 partner ministries. See `RELATIONS.md`.
