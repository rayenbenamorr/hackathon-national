# CLAUDE.md

Guidance for Claude Code working in this repository.

**Read this before touching any file.** You are not editing an application. You
are editing one node of a national digital ecosystem that ~300 teams share, and
the person asking you for a change almost certainly cannot see the consequences
of it. Holding the architecture is your job, not theirs.

---

## What this is

A development playground for a six-day hackathon: **24 ministry services** that
form **one interconnected national platform**, built for ~1 200–1 500 first-year
students with little or no programming experience. They will describe features
in French or English; you implement them.

- 24 services under `services/<id>/`, each a logical microservice with its own
  database namespace, API, published events and consumed events.
- **382 declared relations** between them. Every service is connected to at
  least 14 of the other 23 (§2 of the founding brief).
- Everything runs in **one Node process** on **one port** with **one command**.
  No Docker, no Postgres, no broker, no build step.
- All data is **synthetic**, labelled `synthetic: true`.

---

## The one rule that matters

> **A student changes one ministry. The platform is one system.**
> **Never implement a cross-domain feature inside a single service when other
> ministries are logically affected.**

The student describes the idea. You handle the architecture.

---

## MANDATORY PROCEDURE for any change request

Follow this in order. Do not skip steps 2–4 because the request "sounds small";
that is exactly when integrations get missed.

| #   | Step                                 | Where                                                             |
| --- | ------------------------------------ | ----------------------------------------------------------------- |
| 1   | Identify the target ministry         | the student names it, or `architecture/services.yaml`             |
| 2   | Read its manifest                    | `services/<id>/service.manifest.yaml`                             |
| 3   | Read the global relation graph       | `architecture/relations.yaml` (or `pnpm architecture:graph <id>`) |
| 4   | Identify every affected service      | incoming + outgoing relations of the target                       |
| 5   | Inspect the existing contracts       | `packages/contracts/src/events/<id>.ts`, `services/<id>/API.md`   |
| 6   | Implement the business feature       | `services/<id>/src/modules/<module>.ts`                           |
| 7   | Update API/event contracts if needed | `packages/contracts/src/events/<id>.ts` + `tools/spec/`           |
| 8   | Update the producer                  | `services/<id>/src/routes.ts`, `modules/`, `ctx.publish(...)`     |
| 9   | Update consumers / adapters          | `services/<other>/src/consumers.ts`, `adapters.ts`                |
| 10  | Update mocks and examples            | contract `example`, `services/<id>/examples/`                     |
| 11  | Update relation tests                | `services/<id>/tests/`, `tools/tests/relations.test.ts`           |
| 12  | Update documentation                 | `RELATIONS.md`, `EVENTS.md`, `API.md` via `pnpm generate`         |
| 13  | Run the relevant tests               | `pnpm test`                                                       |
| 14  | Run the architecture validator       | `pnpm architecture:check`                                         |

### Worked example — the one from the brief

Student says:

> "Add a feature to Agriculture that predicts water shortages."

Agriculture is `food-water`. You do **not** stop at `food-water`.

1. `services/food-water/service.manifest.yaml` → it owns farms, water assets,
   fishing zones; it publishes `agriculture.water-shortage.predicted.v1`.
2. `architecture/relations.yaml` → that event is already consumed by
   **resilience, treasury, national-digital-twin, social-mobility, health,
   research, land** — seven ministries, four of them `critical`.
3. Implement the prediction in
   `services/food-water/src/modules/autonomous-water-grid.ts`.
4. Publish through `ctx.publish('agriculture.water-shortage.predicted.v1', …)`.
   The contract already exists; if you add a field it must be **optional**, or
   it is a `.v2`.
5. Now go and make each consumer _do something_: today they store the signal
   (`rememberSignal`) and nothing more. Resilience should raise a watch,
   Treasury should flag exposure, Health should look at its cohorts. **That is
   the part the student did not ask for and needs.**
6. `pnpm test && pnpm architecture:check`.

If a **new** event is required, add it to `tools/spec/services.part*.mjs`,
declare it in `packages/contracts/src/events/<id>.ts`, add the consumers in
`tools/spec/relations.mjs`, run `pnpm generate`, then implement the handlers.

---

## Hard invariants — never break these

1. **No service reads another service's database.** `ctx.db` is scoped and there
   is no API to name another namespace. Cross-service data goes through
   `ctx.platform.call/tryCall` or through events. Validator rule 4.
2. **One event, one owner.** Only `food-water` may publish
   `agriculture.*`. `ctx.publish` refuses otherwise, with the owner's name.
3. **Contracts are versioned.** Adding an optional field: same version. Removing,
   renaming, retyping, or making a field required: new `.vN`, old one kept until
   every consumer has moved.
4. **Synthetic data only.** Never introduce real citizen data, and never remove
   the `synthetic: true` marker. Citizens exist only as pseudonymous ids or
   cohorts (`packages/refs`).
5. **No secrets in the repository.** Keys go in `.env` (git-ignored). Validator
   rule 13 scans for them.
6. **Failures must be readable.** A missing dependency produces
   "_X integration is unavailable_", never `ECONNREFUSED`. Use `tryCall` when the
   caller can degrade, `call` when it genuinely cannot.
7. **No new infrastructure.** Do not add Docker, Kubernetes, a broker, a real
   database or a bundler. §29 of the brief, and 1 500 laptops.
8. **`pnpm generate` never overwrites `services/*/src/`.** That is student code.
   Derived documents (`RELATIONS.md`, `API.md`, `EVENTS.md`, manifests,
   `architecture/*.yaml`) are always regenerated — edit `tools/spec/`, not them.

---

## Where everything is

```
architecture/          services.yaml + relations.yaml  ← the registry, read it first
tools/spec/            THE SOURCE OF TRUTH. Services, events, relations.
tools/scaffold.mjs     Generates services, contracts, docs, the registry.
tools/architecture-check.ts   13 rules. Must pass.

packages/
  contracts/   event + API contracts, the service directory, the relation graph
  refs/        national shared reference objects (ids + universal metadata only)
  events/      envelope, bus, transports
  data/        per-service scoped store — the isolation guarantee lives here
  service-kit/ the micro-framework every service is built on (ctx, routes, signals)
  sdk/         cross-service client + the failure doctrine
  ai/          chat, structured output, embeddings, RAG, agents — mock by default
  iot/         16 sensor kinds, simulator, real-device adapters
  digital-twin/ twin model and registry
  geo/         24 governorates, distance, nearest, GeoJSON
  observability/ traces, flows, structured logs
  auth/        development identity, roles, rate limit, audit
  runtime/     boots the platform
  testing/     the in-memory test platform
  student-tools/ pnpm doctor
  policies|rules|scoring|governance/   EMPTY — reserved for Prompt 02

services/<id>/
  service.manifest.yaml  ← read this before editing the service
  RELATIONS.md           ← read this before changing anything it publishes
  src/index.ts           service definition
  src/domain.ts          the shapes this ministry owns
  src/routes.ts          endpoint declarations
  src/modules/*.ts       the three modules — where features go
  src/consumers.ts       incoming events (already wired, reactions missing)
  src/adapters.ts        outgoing calls to other ministries
  src/seed.ts            synthetic data

apps/api-gateway/        one port, /api/<id>/*, /__platform/*
apps/student-portal/     the page students live in (vanilla, no build)
apps/admin-observability/ traces, dead letters, spend
apps/api-gateway/src/welcome.ts  the per-ministry welcome page served at / on a ministry host
packages/runtime/src/domains.ts  ministry <-> subdomain map AND theme (colour, mark, tagline)
```

---

## Commands

```bash
pnpm install
pnpm dev                    # the whole platform on http://localhost:4000
pnpm dev:service health     # one ministry, to see graceful degradation
pnpm doctor                 # environment + platform diagnosis
pnpm simulate:sensor water-level
pnpm generate               # regenerate from tools/spec (never touches src/)
pnpm architecture:check     # 13 rules
pnpm architecture:graph health
pnpm domains                # the ministry <-> subdomain map (sante., finances., ...)
pnpm test                   # 295 tests
pnpm smoke                  # 13 end-to-end platform checks
pnpm verify                 # lint + typecheck + test + architecture + smoke
pnpm reset                  # delete .data and start over
```

---

## Writing a feature — the shapes you will use

```ts
// A route lives in services/<id>/src/modules/<module>.ts and is declared in routes.ts
export async function forecastDemand(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Farm>(COLLECTION).list({ limit: 20 }); // own data only
  const signals = readSignals(ctx, { eventType: 'environment.climate-risk.updated.v1' });

  const result = await ctx.ai.structured(OutputSchema, prompt, {
    traceId: req.trace.traceId,
    hints: req.body as Record<string, unknown>, // keeps mock answers coherent
  });

  ctx.twins.setState('twin_x', { demand: result.demandM3Day }, 'forecast');

  await ctx.publish('agriculture.water-demand.predicted.v1', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: result, synthetic: true };
}
```

```ts
// Reading another ministry — always through the SDK, never through its database
const capacity = await ctx.platform.tryCall('health', 'GET /capacity');
if (!capacity.ok) ctx.log.warn(`planning without health capacity: ${capacity.reason}`);
```

```ts
// Reacting to another ministry — in services/<id>/src/consumers.ts
{
  event: 'agriculture.water-shortage.predicted.v1',
  from: 'food-water',
  reason: 'Water shortage has a known fiscal shape.',
  handler: async (ctx, envelope) => {
    rememberSignal(ctx, envelope);
    const payload = envelope.payload as { governorate: string; deficitM3Day: number };
    await ctx.publish('treasury.fiscal-risk.flagged.v1', { /* … */ },
      { traceId: envelope.traceId, causationId: envelope.eventId });
  },
}
```

Always forward `traceId` — it is what draws the chain the student reads in the
portal, and it is the difference between "it worked" and "I can show you why".

---

## Language

- Students are Tunisian; they will write in **French**, sometimes in English.
  Answer in the language they used.
- **Student-facing documents** (`STUDENT_GUIDE.md`, `docs/STUDENT_*`) are
  French-first with English alongside.
- **Code, comments, contracts and architecture documents are in English**, which
  is what the rest of the toolchain speaks. Match the file you are in.

---

## What is deliberately absent

Hackathon **rules, scoring, permissions, terms, governance, intellectual
property, submission and evaluation** are the subject of a second specification.
`packages/policies`, `packages/rules`, `packages/scoring` and
`packages/governance` exist as extension points and are intentionally empty.

**Do not invent them.** If a student asks about rules or scoring, say they have
not been defined yet.
