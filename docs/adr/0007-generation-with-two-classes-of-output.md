# ADR-0007 — Generation, with two classes of output

**Status:** accepted · **Date:** 2026-08-28

## Context

24 services × (7 documents + a manifest + ~10 source files + tests + examples)
is ~460 files that must agree with one another and with a relation graph of 382
edges. Hand-written, they diverge within a day. Generated and always
overwritten, they destroy student work.

## Decision

`tools/spec/` is the single source of truth: services, modules, entities, events
and relations. `pnpm generate` produces everything else, in **two classes**:

| Class       | Files                                                                                                                                                 | Rule                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **Derived** | manifests, `RELATIONS.md`, `API.md`, `EVENTS.md`, `architecture/*.yaml`, `contracts/src/services.ts`, `services/registry.ts`, `docs/SERVICE_INDEX.md` | rewritten on every run     |
| **Seeded**  | everything under `services/*/src`, `tests/`, `examples/`, `README.md`, `STUDENT_GUIDE.md`, event contract files                                       | written **only if absent** |

`--force` rewrites both. It is for an organiser preparing a fresh repository,
never for a team mid-hackathon.

## Consequences

- The architecture cannot silently drift: change the spec, regenerate, and the
  documents, the registry and the validator's expectations move together.
- Student code is safe by construction. A team can rewrite an entire service and
  `pnpm generate` will not touch it.
- Seeded files can go stale relative to the spec. That is _why_ the validator
  compares the live code (loaded service definitions, the contract registry)
  against the registry rather than trusting either — rules 7, 8 and 9.
- Generated code must be good code. It is what a beginner reads first and copies
  from, so it carries real comments, real handlers and no `TODO`s.
- `pnpm generate` runs Prettier afterwards, so generation never fails lint.

## Alternatives rejected

**Hand-writing 24 services.** Divergence, and no mechanism to keep 382 relations
implemented.

**Generating everything, always.** Loses six days of work the first time someone
runs it on Wednesday.
