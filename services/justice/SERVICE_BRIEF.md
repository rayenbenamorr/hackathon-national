# SERVICE BRIEF — Justice Intelligence OS

**Ministry:** Justice
**Service id:** `justice`
**Base path:** `/api/justice`

## What this ministry is for

Make the journey of a case legible end to end: where it is, what it is waiting on, and which court is saturated — so delay becomes a measurable, addressable quantity rather than an anecdote.

## The three modules

### 1. Justice Digital Twin

A live twin per court: pending load, average delay, saturation.

`src/modules/justice-digital-twin.ts`

### 2. AI Legal Navigator

RAG over published legal texts so a citizen question gets a sourced answer.

`src/modules/ai-legal-navigator.ts`

### 3. Smart Justice Workflow

Case stages, deadlines and the events other ministries need.

`src/modules/smart-justice-workflow.ts`

## What it owns

Authoritative for: `CaseRef`, `CourtRef`, `LegalTextRef`.

Its own database namespace is `.data/justice.json`, holding the
`cases` collection (40 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                           |
| ------------ | ------------------------------------------------------------------------ |
| AI           | RAG over legal texts · case-duration forecasting · matter classification |
| IoT          | courthouse occupancy sensors · hearing-room environment                  |
| Digital twin | court twin (load, delay, saturation) · case-flow process twin            |

## Connectivity

14 partner ministries. See `RELATIONS.md`.
