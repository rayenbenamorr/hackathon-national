# PLAN_EXECUTION.md — National Hackathon Platform

> Execution board for the 24-ministry AI/IoT hackathon development
> infrastructure. Statuses: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED`.
> No task was silently skipped; anything not done is marked `BLOCKED` with a
> reason, and there are none.

## Progress

| Metric       | Value                                      |
| ------------ | ------------------------------------------ |
| Total tasks  | 68                                         |
| Done         | 68                                         |
| Remaining    | 0                                          |
| Blocked      | 0                                          |
| Current task | — (Prompt 01 complete; awaiting Prompt 02) |

## What was actually built

|                               |                                         |
| ----------------------------- | --------------------------------------- |
| Ministry services             | 24 (all boot, all answer `/health`)     |
| Domain modules                | 72                                      |
| API endpoints                 | 240                                     |
| Event contracts               | 84, versioned and bus-enforced          |
| Declared relations            | 382 (357 event · 25 API · 160 critical) |
| Relations implemented in code | 382 / 382                               |
| Partners per service          | min 14 · target 14 · max 22             |
| Sensor kinds                  | 16                                      |
| Synthetic records seeded      | 1 681 across 24 isolated databases      |
| Files                         | 558                                     |
| Tests                         | 295 passing (33 files)                  |
| Architecture rules            | 13 / 13 passing                         |
| Smoke checks                  | 13 / 13 passing                         |
| Typecheck / format            | clean                                   |

---

## PHASE 0 — Reconnaissance

| #   | Task                                                    | Status | Notes                                                                       |
| --- | ------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| 0.1 | Audit `etude general/` workspace                        | DONE   | ~12 independent projects, not a git repo, no monorepo tooling               |
| 0.2 | Audit `corporate/` (Angular 22 / Supabase / Cloudflare) | DONE   | Strong but unrelated: a marketing SPA, not a service platform               |
| 0.3 | Audit toolchain                                         | DONE   | Node 24.15, npm 11.12, **pnpm 11.22 present** → `pnpm` workflow viable      |
| 0.4 | Decide build location                                   | DONE   | New standalone monorepo `hackathon-national/`; nothing existing overwritten |
| 0.5 | Decide stack                                            | DONE   | TypeScript + `tsx`, **no Docker, no Postgres, no native deps** — ADR-0001   |

## PHASE 1 — Architecture

| #   | Task                                     | Status | Notes                                                     |
| --- | ---------------------------------------- | ------ | --------------------------------------------------------- |
| 1.1 | Monorepo skeleton                        | DONE   | `apps/ packages/ services/ architecture/ tools/ docs/`    |
| 1.2 | Root manifest, tsconfig, vitest config   | DONE   | single package + path aliases — ADR-0002                  |
| 1.3 | `.gitignore`, `.env.example`, no secrets | DONE   | validator rule 13 scans for keys                          |
| 1.4 | Service spec (24 services)               | DONE   | `tools/spec/services.part1.mjs` + `part2.mjs`             |
| 1.5 | Relation spec                            | DONE   | `tools/spec/relations.mjs`, 382 curated relations         |
| 1.6 | Generator                                | DONE   | `tools/scaffold.mjs` — derived vs seeded output, ADR-0007 |
| 1.7 | ADRs                                     | DONE   | `docs/adr/` — 9 records                                   |

## PHASE 2 — Core infrastructure

| #    | Task                                       | Status | Notes                                                                          |
| ---- | ------------------------------------------ | ------ | ------------------------------------------------------------------------------ |
| 2.1  | `packages/refs` — shared reference objects | DONE   | 23 refs; citizens pseudonymous by construction                                 |
| 2.2  | `packages/contracts`                       | DONE   | zod contracts, AsyncAPI, OpenAPI 3.1, service directory, relation graph        |
| 2.3  | `packages/events`                          | DONE   | 9-field envelope, bus, memory + NATS transports — ADR-0005                     |
| 2.4  | `packages/data`                            | DONE   | `StoreAdapter` seam; namespace isolation is unexpressible to bypass — ADR-0003 |
| 2.5  | `packages/observability`                   | DONE   | traces, flows, relation failures, redacted structured logs                     |
| 2.6  | `packages/auth`                            | DONE   | dev identity, roles, HMAC dev tokens, rate limit, audit                        |
| 2.7  | `packages/service-kit`                     | DONE   | `ctx`, router, structured errors, signals, helpers                             |
| 2.8  | `packages/sdk`                             | DONE   | `call` / `tryCall`, the §28 failure doctrine                                   |
| 2.9  | `apps/api-gateway`                         | DONE   | `/api/<id>/*`, `/__platform/*`, SSE stream, static apps                        |
| 2.10 | One-process runtime                        | DONE   | `packages/runtime` — ADR-0004                                                  |
| 2.11 | Standalone service mode                    | DONE   | `pnpm dev:service health`                                                      |

## PHASE 3 — 24 service skeletons

| #    | Task                                             | Status | Notes                                                   |
| ---- | ------------------------------------------------ | ------ | ------------------------------------------------------- |
| 3.1  | Generate all 24 with the mandated file set (§17) | DONE   | verified by validator rule 2                            |
| 3.2  | Health endpoint                                  | DONE   | rule 3                                                  |
| 3.3  | Own database namespace                           | DONE   | rule 4 + `packages/data/tests`                          |
| 3.4  | Standard logging + structured errors             | DONE   | traceId in every error body                             |
| 3.5  | Three modules from §18                           | DONE   | 72 modules                                              |
| 3.6  | Sample APIs                                      | DONE   | 240 endpoints                                           |
| 3.7  | Published events                                 | DONE   | 84 contracts                                            |
| 3.8  | Consumed events with working handlers            | DONE   | 357 handlers; signals stored, reaction left to students |
| 3.9  | Seeded synthetic data                            | DONE   | 1 681 rows, deterministic, all `synthetic: true`        |
| 3.10 | Contract + relation tests per service            | DONE   | 6 tests × 24                                            |
| 3.11 | All 24 boot                                      | DONE   | smoke check 1                                           |

## PHASE 4 — Relationship graph

| #   | Task                                           | Status | Notes                                                                 |
| --- | ---------------------------------------------- | ------ | --------------------------------------------------------------------- |
| 4.1 | `architecture/services.yaml`                   | DONE   | generated                                                             |
| 4.2 | `architecture/relations.yaml`                  | DONE   | 382 relations with reason, contract, criticality, implementation path |
| 4.3 | Minimum connectivity automatically validated   | DONE   | rule 10; min 14                                                       |
| 4.4 | Relations implemented, not only documented     | DONE   | rules 7 + 9 — ADR-0008                                                |
| 4.5 | Relation tests (producer → expected consumers) | DONE   | 100 tests in `tools/tests/relations.test.ts`                          |
| 4.6 | Contract drift detection                       | DONE   | `tools/tests/contracts.test.ts`                                       |

## PHASE 5 — AI / IoT / Digital Twin / Geo

| #   | Task                       | Status | Notes                                                                                     |
| --- | -------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| 5.1 | `packages/ai`              | DONE   | chat, structured, embeddings, RAG, tools, agents, classify, extract, summarise, recommend |
| 5.2 | AI mock mode with zero key | DONE   | synthesised from the caller's schema — ADR-0006                                           |
| 5.3 | Real providers via env     | DONE   | OpenRouter + Anthropic; falls back to mock rather than crashing                           |
| 5.4 | `packages/iot`             | DONE   | 16 kinds, simulator, anomaly injection, `DeviceAdapter` seam                              |
| 5.5 | Sensor simulator CLI       | DONE   | `pnpm simulate:sensor water-level` — posts to the public ingest endpoint                  |
| 5.6 | `packages/digital-twin`    | DONE   | full §15 shape; cross-boundary references only                                            |
| 5.7 | `packages/geo`             | DONE   | 24 governorates, distance, `nearest`, GeoJSON, seeded placement                           |

## PHASE 6 — Student experience

| #   | Task                                     | Status | Notes                                                                     |
| --- | ---------------------------------------- | ------ | ------------------------------------------------------------------------- |
| 6.1 | `apps/student-portal`                    | DONE   | ministry view, endpoints with "try it", relations, signals, twins, traces |
| 6.2 | Relationship graph + broken integrations | DONE   | inline SVG, 382 edges, red when broken — ADR-0009                         |
| 6.3 | `apps/admin-observability`               | DONE   | event chains, dead letters, AI spend, platform log                        |
| 6.4 | `docs/STUDENT_START_HERE.md`             | DONE   | FR + EN, 5 steps                                                          |
| 6.5 | `docs/STUDENT_CLAUDE_PROMPTS.md`         | DONE   | 10 templates + what not to ask                                            |
| 6.6 | `STUDENT_GUIDE.md` per service           | DONE   | 24 files, ministry-specific                                               |
| 6.7 | One-command development                  | DONE   | `pnpm install && pnpm dev`                                                |
| 6.8 | `packages/student-tools`                 | DONE   | `pnpm doctor`                                                             |
| 6.9 | Root `CLAUDE.md`                         | DONE   | 14-step mandatory procedure, 8 hard invariants, worked example            |

## PHASE 7 — Validation

| #   | Task                      | Status | Notes                                         |
| --- | ------------------------- | ------ | --------------------------------------------- |
| 7.1 | `pnpm architecture:check` | DONE   | 13 rules, all passing                         |
| 7.2 | Typecheck                 | DONE   | clean                                         |
| 7.3 | Lint (Prettier)           | DONE   | clean; `pnpm generate` formats its own output |
| 7.4 | Unit tests                | DONE   | data, geo, events, ai, iot, sdk, digital-twin |
| 7.5 | Contract tests            | DONE   | 9                                             |
| 7.6 | Relation tests            | DONE   | 100                                           |
| 7.7 | Integration smoke test    | DONE   | 13 checks, end to end                         |
| 7.8 | `pnpm verify`             | DONE   | runs all of the above                         |

## PHASE 8 — Documentation

| #   | Task                        | Status | Notes                                      |
| --- | --------------------------- | ------ | ------------------------------------------ |
| 8.1 | `README.md`                 | DONE   |                                            |
| 8.2 | `docs/ARCHITECTURE.md`      | DONE   |                                            |
| 8.3 | `docs/PLATFORM_CONCEPTS.md` | DONE   | seven ideas, in French                     |
| 8.4 | `docs/TROUBLESHOOTING.md`   | DONE   |                                            |
| 8.5 | `docs/adr/*`                | DONE   | 9 ADRs, each with rejected alternatives    |
| 8.6 | `docs/ORGANISERS.md`        | DONE   | running the event for 1 200–1 500 students |

## PHASE 9 — Reserved for Prompt 02

| #   | Task                                          | Status | Notes                   |
| --- | --------------------------------------------- | ------ | ----------------------- |
| 9.1 | `packages/policies`                           | DONE   | minimal extension point |
| 9.2 | `packages/rules`                              | DONE   | minimal extension point |
| 9.3 | `packages/scoring`                            | DONE   | minimal extension point |
| 9.4 | `packages/governance`                         | DONE   | minimal extension point |
| 9.5 | No hackathon law / scoring / IP rule invented | DONE   | deliberately empty      |

---

## Bugs found and fixed during construction

Recorded because each is a decision, not an accident, and the tests that pin
them exist for a reason.

| #   | Bug                                                                                                               | Found by                          | Fix                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------- |
| 1   | Mock AI produced floats for `int` fields; the bus correctly refused the event                                     | first live AI call                | synthesizer reads zod checks (int / min / max) — ADR-0006                   |
| 2   | Mock answers ignored the caller's input (forecast for Kairouan came back about another governorate)               | manual review of a demo path      | `hints` carried through and re-validated                                    |
| 3   | **Event delivery stopped after ~6 consumers**, silently — an observation reached 6 of 16 ministries with no error | `pnpm smoke`                      | in-memory transport now awaits delivery — ADR-0005, regression test added   |
| 4   | Three synchronous call cycles (`environment↔industrial-energy`, `skills↔research`, `food-water↔land`)             | `pnpm architecture:check` rule 11 | one direction of each removed, with the reason recorded in `relations.mjs`  |
| 5   | Generated twin state collided with an entity's own `status` field (4 services)                                    | `pnpm typecheck`                  | generator omits the default marker when the field exists                    |
| 6   | Generated list handlers filtered on `governorate` in ministries that key by country or origin                     | `pnpm typecheck`                  | generator binds the filter to the field that actually carries a governorate |
| 7   | Gateway's wildcard subscriber appeared as a consumer in every student-visible trace                               | portal review                     | observers excluded from flow records                                        |

## Known limitations (stated, not hidden)

- **Single process.** Real service isolation is logical, not operational — see
  ADR-0004 for why, and for the seam that makes splitting possible.
- **The JSON store has no joins, transactions or concurrent writers.** Nothing
  in the 24 services needs them; `StoreAdapter` is the exit.
- **357 consumer handlers store the signal and stop.** That is the deliberate
  division of labour with the students, and it is stated in every handler.
- **Mock AI is a shape generator, not a reasoner.** Real reasoning needs a key.
- **`pnpm install` needs the network once.** Everything after that is offline.
