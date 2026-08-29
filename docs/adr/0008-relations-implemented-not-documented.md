# ADR-0008 — Relations are implemented, not documented

**Status:** accepted · **Date:** 2026-08-28

## Context

§2 requires every service to have meaningful relationships with ~60% of the
others, and warns against fake dependencies. §31 (Phase 4) is blunt: _do not
leave relations only in documentation._

A relation registry that nothing enforces is a diagram.

## Decision

Every one of the 382 declared relations is materialised in code:

- an **event relation** becomes a consumer entry in the consuming service, with
  the producer named and the reason quoted, and it already calls
  `rememberSignal` — so the signal is stored and visible at
  `GET /api/<id>/signals` before a student writes anything;
- an **API relation** becomes an adapter function in the consuming service, plus
  a row in `API_DEPENDENCIES` that `GET /api/<id>/dependencies` reports live.

Three checks keep it honest: validator rules 7 and 9, the contract tests, and
100 relation tests that publish each critical event and assert every declared
consumer received and stored it.

## Consequences

- The connectivity claim is testable, and tested, rather than asserted.
- **Wiring is done; reaction is not.** Each generated handler stores the signal
  and then stops, with a comment marking where the ministry's decision goes.
  That is the deliberate division: the platform does the integration, the
  student does the domain thinking.
- 382 handlers is a lot of near-identical code. It is generated, and the
  duplication buys a beginner the ability to read one file and understand every
  incoming connection their ministry has.
- Declaring a relation is now expensive — it must be plausible, implemented and
  tested. That is the intended pressure against padding the count.

## Alternatives rejected

**A registry with no code.** Exactly what §31 forbids.

**Generic reflection-based routing.** Fewer lines, but a student could not see
what their service listens to by opening a file.
