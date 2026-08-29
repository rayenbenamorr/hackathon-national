# ADR-0003 — A JSON store behind a `StoreAdapter`

**Status:** accepted · **Date:** 2026-08-28

## Context

§7 permits one local PostgreSQL with a database or schema per service, and
requires absolutely that **no service queries another service's database**.

PostgreSQL means an install, a service to start, credentials, and migrations —
per laptop. SQLite avoids the server but `better-sqlite3` is a native module and
`node:sqlite` still emits experimental warnings on some Node 24 builds.

## Decision

A `StoreAdapter` interface with two implementations: `JsonFileAdapter` (one
`.json` per service under `.data/`, debounced writes) and `MemoryAdapter` (tests
and the smoke run).

Everything above the interface — all 24 services — is written against
`ServiceStore`, never against the adapter.

## Consequences

- Zero installation, zero native modules, works on every platform.
- **A student can open `.data/health.json` and see their own rows.** For a
  beginner that legibility is worth more than query power they will not use in
  six days.
- Isolation is structural: `openServiceStore(id)` is called once by the runtime
  with the service's own id, and `ServiceStore` exposes no method that takes a
  namespace. Cross-service reads are not forbidden by policy, they are
  unexpressible. Validator rule 4 catches attempts to go around it.
- No joins, no transactions, no concurrent writers. None of the 24 services
  needs them; a team that does can write an adapter.
- Moving to PostgreSQL later is **one new adapter**, not 24 service changes.

## Alternatives rejected

**PostgreSQL with a schema per service.** Correct and explicitly allowed; the
per-laptop setup cost is the whole objection.

**SQLite.** Closer to real, but a native module or an experimental API in
exchange for capability nobody will use here.
