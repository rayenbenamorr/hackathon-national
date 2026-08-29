# SERVICE BRIEF — Social Mobility OS

**Ministry:** Social Affairs
**Service id:** `social-mobility`
**Base path:** `/api/social-mobility`

## What this ministry is for

Detect need from signals other ministries already produce, instead of waiting for a household to prove it at a counter.

## The three modules

### 1. Social Digital Twin

Vulnerability per household cohort, continuously updated.

`src/modules/social-digital-twin.ts`

### 2. Zero-Form Social Services

Eligibility computed from existing signals.

`src/modules/zero-form-social-services.ts`

### 3. Social Mobility AI

What actually moves a cohort upward, by governorate.

`src/modules/social-mobility-ai.ts`

## What it owns

Authoritative for: `HouseholdCohortRef`, `SocialBenefitRef`.

Its own database namespace is `.data/social-mobility.json`, holding the
`cohorts` collection (36 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                       |
| ------------ | ------------------------------------------------------------------------------------ |
| AI           | need detection from weak signals · eligibility explanation · mobility driver ranking |
| IoT          | housing conditions · water and energy access                                         |
| Digital twin | household cohort twin · governorate social twin                                      |

## Connectivity

16 partner ministries. See `RELATIONS.md`.
