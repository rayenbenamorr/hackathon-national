# SERVICE BRIEF — Adaptive Education OS

**Ministry:** Education
**Service id:** `education`
**Base path:** `/api/education`

## What this ministry is for

Adapt what is taught to what the country is measurably about to need, and notice a failing school building before it is a headline.

## The three modules

### 1. Student Learning Twin

Cohort-level mastery and progression, never a named pupil.

`src/modules/student-learning-twin.ts`

### 2. Smart School IoT

Air quality, occupancy and building condition per school.

`src/modules/smart-school-iot.ts`

### 3. National Knowledge Graph

Concepts, prerequisites and programme coverage.

`src/modules/national-knowledge-graph.ts`

## What it owns

Authoritative for: `SchoolRef`, `EducationProgramRef`, `LearnerCohortRef`.

Its own database namespace is `.data/education.json`, holding the
`schools` collection (42 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                               |
| ------------ | ---------------------------------------------------------------------------- |
| AI           | learning path adaptation · dropout risk detection · knowledge graph querying |
| IoT          | air quality · occupancy · temperature · structural strain                    |
| Digital twin | school twin · learner cohort twin                                            |

## Connectivity

19 partner ministries. See `RELATIONS.md`.
