# SERVICE BRIEF — National Skills & Opportunity OS

**Ministry:** Employment & Vocational Training
**Service id:** `skills-opportunity`
**Base path:** `/api/skills-opportunity`

## What this ministry is for

Read skill demand from what the other ministries are actually building, and open real missions against the gaps.

## The three modules

### 1. National Skills Graph

Skills, adjacencies and regional supply.

`src/modules/national-skills-graph.ts`

### 2. AI Career Digital Twin

A path from where a person is to where demand is.

`src/modules/ai-career-digital-twin.ts`

### 3. National Micro-Mission Network

Short, real assignments published against detected gaps.

`src/modules/national-micro-mission-network.ts`

## What it owns

Authoritative for: `SkillRef`, `MicroMissionRef`, `CareerPathRef`.

Its own database namespace is `.data/skills-opportunity.json`, holding the
`skills` collection (40 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                              |
| ------------ | ------------------------------------------------------------------------------------------- |
| AI           | gap detection from cross-ministry demand · career path planning · skill adjacency embedding |
| IoT          | training centre occupancy                                                                   |
| Digital twin | skill twin · regional labour twin                                                           |

## Connectivity

15 partner ministries. See `RELATIONS.md`.
