# SERVICE BRIEF — Connected Health Intelligence System

**Ministry:** Health
**Service id:** `health`
**Base path:** `/api/health`

## What this ministry is for

Publish capacity continuously so no other ministry has to guess it, and read the environment so that a health event is anticipated rather than counted.

## The three modules

### 1. Personal Health Digital Twin

Pseudonymous cohort twins — never an identified person.

`src/modules/personal-health-digital-twin.ts`

### 2. Smart Hospital Operating System

Beds, ICU, emergency load, in real time.

`src/modules/smart-hospital-operating-system.ts`

### 3. Healthcare Mesh

Coordination with transport, social services and emergency.

`src/modules/healthcare-mesh.ts`

## What it owns

Authoritative for: `HospitalRef`, `HealthCapacity`, `CareEpisodeRef`.

Its own database namespace is `.data/health.json`, holding the
`facilities` collection (34 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                              |
| ------------ | ----------------------------------------------------------- |
| AI           | triage · epidemic signal detection · capacity forecasting   |
| IoT          | wearable heart rate · air quality · occupancy · temperature |
| Digital twin | hospital twin · cohort health twin                          |

## Connectivity

20 partner ministries. See `RELATIONS.md`.
