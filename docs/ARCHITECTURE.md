# Architecture

> The technical account of the platform. If you are a student, read
> [`STUDENT_START_HERE.md`](STUDENT_START_HERE.md) instead — you do not need
> this to build a feature.

---

## 1. The thesis

The hackathon is not 24 applications. It is **one national digital ecosystem
with 24 domains**, and every design decision below follows from that single
sentence — including the ones that look like they are about laptops.

Two forces pull against each other, and the whole architecture is where they are
reconciled:

| Force                                                 | Consequence                                                             |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| The systems must be genuinely interdependent (§2)     | real service boundaries, contracts, an event bus, a relation registry   |
| The people building them have never written code (§4) | one command, one port, one process, no Docker, no broker, no build step |

The resolution: **logical boundaries enforced in code, operational simplicity
enforced by refusing infrastructure.** Boundaries cost nothing at runtime;
operations cost 1 500 people an afternoon each.

---

## 2. The shape

```
                         ┌──────────────────────────────────┐
  browser ──────────────▶│  api-gateway            :4000    │
  curl / ESP32           │  /            student portal      │
                         │  /admin       observability       │
                         │  /api/<ministry>/*                │
                         │  /__platform/*  introspection     │
                         └───────────┬──────────────────────┘
                                     │  in-process dispatch
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
  ┌───────────┐               ┌───────────┐                ┌───────────┐
  │  justice  │               │  health   │      …  24 …   │  culture  │
  │ ctx.db    │               │ ctx.db    │                │ ctx.db    │
  │ ctx.twins │               │ ctx.twins │                │ ctx.twins │
  └─────┬─────┘               └─────┬─────┘                └─────┬─────┘
        │                           │                            │
        └───────────────┬───────────┴────────────┬───────────────┘
                        ▼                        ▼
              ┌──────────────────┐    ┌────────────────────┐
              │  event bus       │    │  platform SDK      │
              │  84 contracts    │    │  call / tryCall    │
              └──────────────────┘    └────────────────────┘
```

Everything above runs in **one Node process**. The boundaries are not weaker for
it: a service physically cannot reach another service's data, and the only two
ways across a boundary are the bus and the SDK.

---

## 3. Service boundaries, and how they are enforced

A ministry service is a `ServiceDefinition`: id, three modules, routes,
consumers, a seeder. The runtime hands it a `ServiceContext` and that context is
the entire world it can see.

| It has                                    | It does not have                  |
| ----------------------------------------- | --------------------------------- |
| `ctx.db` — **its own** namespace          | any way to name another namespace |
| `ctx.twins` — its own twins               | another ministry's twins          |
| `ctx.publish` — the events **it owns**    | permission to publish another's   |
| `ctx.platform` — HTTP to other ministries | their internals                   |
| `ctx.ai`, `ctx.log`                       | —                                 |

`openServiceStore(id)` is called once, by the runtime, with the service's own
id. There is no method on `ServiceStore` that takes a namespace. The isolation
is therefore **structural, not procedural** — a student cannot violate it by
accident, and `pnpm architecture:check` rule 4 catches anyone trying on purpose.

---

## 4. The contract layer

`packages/contracts` owns every event schema (zod), the service directory and
the relation graph. Two properties matter:

**Ownership is exclusive.** `defineEvent` throws if two services claim the same
type. `ctx.publish` refuses a type this service does not own, naming the owner.

**Validation is not optional.** The bus calls the contract validator before
delivery. An event that breaks its own contract is dead-lettered, logged with
the exact failing field and the file to open, and never delivered — so a
consumer can never receive a payload it was not written against.

Versioning: an optional field is a compatible change; anything else is `.v2`,
with `.v1` kept alive until every consumer has moved.

The registry also emits AsyncAPI (`toAsyncApi()`) and OpenAPI 3.1 per service
(`/api/<id>/openapi.json`), generated from the same declarations — so the
documents cannot drift from the code.

---

## 5. The event bus

`packages/events`. Envelope per §8: `eventId`, `eventType`, `version`,
`timestamp`, `sourceService`, `correlationId`, `traceId`, `payload`, `metadata`.

The transport is pluggable (`memory` by default, a NATS adapter present and
opt-in). The in-memory transport **awaits delivery**: when `await ctx.publish()`
returns, every consumer has run. That is deliberately unlike a production
broker, and it is why a test, a smoke run and a trace in the portal are all
deterministic. The first implementation did not await, and delivery silently
stopped after whichever consumers happened to share a microtask —
`packages/events/tests/bus.test.ts` exists to keep that fixed.

A failing consumer is isolated: it is logged and recorded, and the other
consumers still run.

---

## 6. Failure handling

`ctx.platform.call()` throws `DependencyUnavailableError` (HTTP 424) with the
ministry's human name, the reason, and the command to run. `tryCall()` never
throws and returns `{ ok: false, degraded: true, reason, fallback }`.

Every failure is recorded as a **relation failure**, which is what the portal
paints red and what `GET /api/<id>/dependencies` reports.

The measure of success is a sentence:

```
Autonomous Mobility & Logistics Grid integration is unavailable —
the service is not running in this platform instance.
  → Start the whole platform with "pnpm dev".
```

not `ECONNREFUSED 172.18.0.12:4222`.

---

## 7. Observability

No collector, no Jaeger, no Docker. `packages/observability` keeps bounded
in-memory rings of logs, hops and relation failures, and the gateway exposes
them. The unit that matters to a student is not a span, it is a **flow**:

```
food-water
 → agriculture.water-shortage.predicted.v1 → resilience
                                           → treasury
                                           → national-digital-twin
                                           → social-mobility
                                           → health
                                           → research
                                           → land
```

`traceId` is minted at the gateway and forwarded through every call and every
event; `/admin` renders the tree.

Logs are structured and **redacted**: a field named `nationalId`, `email`,
`diagnosis` or `phone` never reaches a log line.

---

## 8. AI, IoT, twins, geo

- **AI** (`packages/ai`) — chat, structured output, embeddings, RAG, tool
  calling, agents, classification, extraction, summarisation, recommendation.
  The default provider is `mock`: deterministic, offline, free. Structured
  output is synthesised **from the caller's zod schema**, so it always validates
  — including `int`, ranges and enums — and `hints` carries the caller's own
  input through, so a mocked answer about Kairouan is about Kairouan. Setting
  `AI_PROVIDER=openrouter|anthropic` changes the quality without changing one
  line of student code.
- **IoT** (`packages/iot`) — 16 sensor kinds with realistic daily rhythms and
  ranges, a deterministic simulator, injectable anomalies, and a
  `DeviceAdapter` seam. `pnpm simulate:sensor <kind>` POSTs to the same public
  ingest endpoint a real ESP32 would use, so simulated and real are one path.
- **Digital twins** (`packages/digital-twin`) — id, type, state, location,
  attributes, observations, relationships, history, lastUpdated. A twin exposes
  a **reference** across boundaries (id, type, location, status) and never its
  state or observations. Citizens exist only as `citizen-cohort`.
- **Geo** (`packages/geo`) — the 24 governorates, haversine distance, `nearest`
  (the platform's most reused primitive), point-in-polygon, GeoJSON, and seeded
  synthetic placement so the same farm sits at the same coordinates on every
  laptop in the room.

---

## 9. The relation graph

`tools/spec/relations.mjs` is the source; `architecture/relations.yaml` and
`packages/contracts/src/services.ts` are generated from it.

- **382 relations**, each with a stated domain purpose and a criticality.
- Every service reaches **at least 14** of the other 23 (§2's ≈60% target).
- Every event relation is implemented as a **consumer handler** in the consuming
  service; every API relation as an **adapter**. Nothing lives only in a
  document — validator rules 7 and 9.
- Synchronous cycles are refused (rule 11). Event cycles are allowed: that is
  what an event-driven system is for. Three genuine synchronous cycles were
  found and removed during construction, and the comments in `relations.mjs`
  record why each direction survived.

---

## 10. Generation

`tools/spec/` → `pnpm generate` → services, contracts, manifests, documents, the
registry.

Two classes of output, and the difference is the point:

|      | Rewritten every run                                                                                   | Written once                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| what | manifests, `RELATIONS.md`, `API.md`, `EVENTS.md`, `architecture/*.yaml`, `services.ts`, `registry.ts` | everything under `services/*/src`, `tests`, `examples`, event contract files |
| why  | derived — editing them by hand is how an architecture rots                                            | **student code** — the generator must never overwrite six days of work       |

`--force` rewrites everything; it is for an organiser rebuilding a fresh
repository, not for a team on day three.

---

## 11. What was deliberately not built

Kubernetes, a service mesh, a message broker as a dependency, PostgreSQL,
per-service containers, a front-end build pipeline, distributed tracing
infrastructure, and a monorepo tool.

Each was weighed against §29 and against the same question: _does a first-year
student ever need to know this exists during six days?_ When the answer was no,
the seam was built and the product was not (`StoreAdapter`, `EventTransport`,
`DeviceAdapter`, `AiProvider`). Swapping the JSON store for PostgreSQL is one
new adapter, not 24 service changes.

See [`adr/`](adr/) for each decision and what it cost.
