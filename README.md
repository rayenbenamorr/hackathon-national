# Tunisia National Digital Ecosystem — hackathon development platform

**24 ministry services. One country. One command.**

> **A pedagogical exercise.** This platform is a hackathon playground. It is not
> affiliated with, endorsed by, or operated on behalf of any Tunisian public
> administration. Every ministry here is a fictional service holding synthetic
> data: nothing in this repository describes a real institution, and nothing it
> produces engages one.

A protected development playground for a six-day AI/IoT hackathon with
~1 200–1 500 students who have little or no programming experience. They describe
what they want to build; **Claude Code** handles service boundaries, contracts,
events, integrations and tests.

```bash
pnpm install
pnpm dev          # → http://localhost:4000
```

No Docker. No database to install. No API key. No build step.

---

## What is running after that one command

|              |                                                                                    |
| ------------ | ---------------------------------------------------------------------------------- |
| **24**       | ministry services, each with its own database, API, events and digital twins       |
| **72**       | domain modules (three per ministry, from the founding brief)                       |
| **382**      | declared relations — every service reaches **≥ 14** of the other 23                |
| **357 + 25** | of those are event subscriptions and API dependencies, **all implemented in code** |
| **84**       | versioned event contracts, enforced by the bus                                     |
| **240**      | API endpoints behind one gateway on one port                                       |
| **16**       | sensor kinds, simulated, feeding the ministries that care                          |
| **1 681**    | synthetic records, seeded deterministically, labelled `synthetic: true`            |
| **0**        | containers, brokers, databases or build steps to install                           |

---

## Where to go

| You are                             | Read                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------- |
| **a student**                       | [`docs/STUDENT_START_HERE.md`](docs/STUDENT_START_HERE.md) — 10 minutes     |
| a student who wants the right words | [`docs/STUDENT_CLAUDE_PROMPTS.md`](docs/STUDENT_CLAUDE_PROMPTS.md)          |
| a student who wants the ideas       | [`docs/PLATFORM_CONCEPTS.md`](docs/PLATFORM_CONCEPTS.md)                    |
| stuck                               | [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)                        |
| **an organiser**                    | [`docs/ORGANISERS.md`](docs/ORGANISERS.md)                                  |
| **an engineer**                     | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/adr/`](docs/adr/) |
| **Claude Code**                     | [`CLAUDE.md`](CLAUDE.md) — the mandatory procedure                          |
| looking for a ministry              | [`docs/SERVICE_INDEX.md`](docs/SERVICE_INDEX.md)                            |

---

## The idea in one picture

A student writes one sentence:

> _"Add a feature to Agriculture that predicts water shortages."_

Claude Code reads the manifest and the relation graph, and the shortage
prediction does not stay inside Agriculture:

```
food-water
 → agriculture.water-shortage.predicted.v1 → resilience          (declare a watch)
                                           → treasury            (fiscal exposure)
                                           → national-digital-twin (regional stress)
                                           → social-mobility     (rural households)
                                           → health              (health consequence)
                                           → research            (research trigger)
                                           → land                (freeze siting)
```

Seven ministries the student never mentioned. That is the platform's whole job.

---

## Commands

```bash
pnpm dev                    # the whole platform          http://localhost:4000
pnpm dev:service health     # one ministry, to see graceful degradation
pnpm doctor                 # diagnose environment + platform
pnpm simulate:sensor water-level
pnpm seed / pnpm reset      # synthetic data
pnpm generate               # regenerate from tools/spec (never touches src/)
pnpm architecture:check     # 13 architecture rules
pnpm architecture:graph health
pnpm test                   # 295 tests
pnpm smoke                  # 13 end-to-end platform checks
pnpm verify                 # all of the above
```

---

## Repository

```
architecture/     services.yaml · relations.yaml        the registry
tools/spec/       THE SOURCE OF TRUTH                   services, events, relations
tools/            scaffold · architecture-check · smoke · seed · reset
packages/         contracts refs events data service-kit sdk ai iot digital-twin
                  geo observability auth runtime testing student-tools
                  policies rules scoring governance      ← reserved for Prompt 02
services/<id>/    24 ministries: manifest, docs, src, tests, examples
apps/             api-gateway · student-portal · admin-observability
docs/             student guides, architecture, ADRs, organiser handbook
```

---

## Ground rules

1. No service reads another service's database — it is structurally impossible.
2. One event, one owner. Contracts are versioned and enforced at the bus.
3. Synthetic data only. Citizens exist as pseudonymous ids or cohorts.
4. No secrets in the repository. Keys live in `.env`.
5. A missing dependency produces a sentence, never `ECONNREFUSED`.

`pnpm architecture:check` enforces all five.

---

## Not in scope here

Hackathon rules, permissions, scoring, terms, governance, intellectual property,
submission and evaluation are the subject of a **second specification**.
`packages/policies`, `packages/rules`, `packages/scoring` and
`packages/governance` are extension points and are deliberately empty. Nothing
about them has been invented.
