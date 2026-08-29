# For the organisers

Running this platform for ~1 200–1 500 students over six days.

---

## Before the event

### 1. Verify a clean machine

On a laptop that has never seen this repository:

```bash
git clone <repo> && cd hackathon-national
pnpm install
pnpm dev
```

Then, in a second terminal:

```bash
pnpm doctor       # must be all green except "Platform" if dev is not running
pnpm verify       # lint + typecheck + 295 tests + 13 architecture rules + 13 smoke checks
```

Expected: **24/24 services**, `Architecture valid`, `13/13 checks passed`.

### 2. Decide the AI mode

| Mode | `.env`                                          | Cost     | Recommendation             |
| ---- | ----------------------------------------------- | -------- | -------------------------- |
| Mock | nothing to do (default)                         | zero     | **Days 1–2 for everyone.** |
| Real | `AI_PROVIDER=openrouter` + `OPENROUTER_API_KEY` | per call | Optional, later, per team  |

Mock mode is not a degraded mode: every AI feature works, offline, and always
satisfies the caller's schema. If you distribute keys, `AI_MAX_CALLS_PER_MINUTE`
is the guard against one runaway loop spending a shared budget, and
`/__platform/ai` shows spend per ministry live.

**Never commit a key.** Validator rule 13 scans for them.

### 3. Prepare the offline path

`pnpm install` is the only step needing the network. On a weak venue link:

- pre-install `node_modules` on a USB image, or
- run `pnpm install` once and distribute the folder, or
- have students install the evening before.

Everything after that — the 24 services, the AI, the sensors, the portal — is
offline.

### 4. Assign ministries

24 governorates, 24 ministries. `docs/SERVICE_INDEX.md` lists all of them with
their event and relation counts. Give each team one `<service-id>`; the portal
remembers the choice per browser.

Consider pairing teams whose ministries have a `critical` relation
(`pnpm architecture:graph <id>`) — the integration between them becomes a
deliverable neither can fake.

---

## During the event

### The three commands to teach on the first morning

```bash
pnpm dev                  # start everything
pnpm doctor               # when anything is wrong
pnpm verify               # before committing
```

Nothing else is mandatory.

### Watching the room

```bash
curl localhost:4000/__platform/health     # 24/24?
curl localhost:4000/__platform/failures   # broken integrations
curl localhost:4000/__platform/ai         # spend, per ministry
```

`http://localhost:4000/admin` shows the event chains, the dead-letter queue
(events that break their own contract — a producer's bug) and the platform log.

### The predictable failures, and their one-line answers

| What you will hear             | Answer                                                                   |
| ------------------------------ | ------------------------------------------------------------------------ |
| "port already in use"          | it is already running in another terminal                                |
| "my event doesn't arrive"      | `/__platform/events` — does anyone subscribe? then the dead-letter queue |
| "the AI gives generic answers" | that is mock mode, and it is correct                                     |
| "another service is down"      | `pnpm dev` starts all 24; `dev:service` starts one on purpose            |
| "I broke everything"           | `pnpm reset && pnpm dev`; code is never touched                          |

### Keeping the architecture intact across ~300 teams

`pnpm architecture:check` is the referee. It fails when a team:

- reads another ministry's database,
- publishes an event it does not own,
- breaks a contract other teams depend on,
- declares a relation it did not implement,
- creates a synchronous call cycle,
- commits a key.

Run it in CI on every push, or at minimum at each daily checkpoint.

---

## What is NOT in this platform

Hackathon rules, team rules, permissions, eligibility, competition rules,
scoring, terms, governance, intellectual property, submission and evaluation.

These are the subject of the second specification.
`packages/policies`, `packages/rules`, `packages/scoring` and
`packages/governance` exist, are wired into the alias table, and are
intentionally empty. Nothing about them has been invented — if a student asks,
the answer is that they have not been defined yet.

---

## Judging suggestions (technical only)

The platform can evidence, objectively, per team:

| Question                                      | Where                                     |
| --------------------------------------------- | ----------------------------------------- |
| Does it still respect the architecture?       | `pnpm architecture:check`                 |
| Does it actually integrate, or only claim to? | `/__platform/graph` — `observed` per edge |
| Did other ministries really react?            | `/admin` — the event chains               |
| Is the AI real work or a wrapper?             | `/__platform/ai` and the module source    |
| Is the IoT connected to anything?             | twins carrying observations, `GET /twins` |
| Do their tests exist and pass?                | `pnpm test`                               |

A team whose service produces events nobody consumes has built one application.
A team whose event changes what four other ministries do has built part of a
country. The graph shows the difference without an argument.
