# SERVICE BRIEF — Tunisia Research Brain

**Ministry:** Higher Education & Research
**Service id:** `research`
**Base path:** `/api/research`

## What this ministry is for

Connect what laboratories can already do to what ministries are currently blocked on — the gap between the two is where most public value is lost.

## The three modules

### 1. National Research Brain

Projects, disciplines, maturity, findings.

`src/modules/national-research-brain.ts`

### 2. Living Lab Tunisia

Real-territory pilots with instrumented outcomes.

`src/modules/living-lab-tunisia.ts`

### 3. AI Innovation Transfer Engine

Matches a research result to the ministry that needs it.

`src/modules/ai-innovation-transfer-engine.ts`

## What it owns

Authoritative for: `ResearchProjectRef`, `PatentRef`, `LivingLabRef`.

Its own database namespace is `.data/research.json`, holding the
`projects` collection (38 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                         |
| ------------ | ---------------------------------------------------------------------- |
| AI           | RAG over publications · need-to-capability matching · maturity scoring |
| IoT          | living lab instrumentation                                             |
| Digital twin | project twin · living lab twin                                         |

## Connectivity

17 partner ministries. See `RELATIONS.md`.
