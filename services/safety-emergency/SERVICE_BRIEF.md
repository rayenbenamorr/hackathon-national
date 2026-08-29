# SERVICE BRIEF — National Safety & Emergency Grid

**Ministry:** Interior
**Service id:** `safety-emergency`
**Base path:** `/api/safety-emergency`

## What this ministry is for

Receive an incident from anywhere, understand it in seconds, and pull the nearest capable resource from whichever ministry owns it.

## The three modules

### 1. National Emergency Brain

Triage, severity and the dispatch decision.

`src/modules/national-emergency-brain.ts`

### 2. AI Road Safety Grid

Continuous risk scoring of road segments.

`src/modules/ai-road-safety-grid.ts`

### 3. Smart Civil Services

Civil requests that do not need an emergency response.

`src/modules/smart-civil-services.ts`

## What it owns

Authoritative for: `IncidentRef`, `PatrolUnitRef`.

Its own database namespace is `.data/safety-emergency.json`, holding the
`incidents` collection (30 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                      |
| ------------ | ------------------------------------------------------------------- |
| AI           | incident triage · road risk scoring · dispatch recommendation agent |
| IoT          | traffic flow · air quality · rainfall · vibration                   |
| Digital twin | incident twin · road segment twin                                   |

## Connectivity

19 partner ministries. See `RELATIONS.md`.
