# ADR-0005 — An in-memory bus that awaits delivery

**Status:** accepted · **Date:** 2026-08-28

## Context

§8 asks for a lightweight local event system and suggests NATS. A broker is a
process to install, run and explain — for an event volume that fits in a laptop's
memory a hundred times over.

## Decision

`MemoryTransport` is the default; a `NatsTransport` exists behind
`EVENT_TRANSPORT=nats` and lazily imports an optional dependency, failing with
one readable sentence if it is absent.

`MemoryTransport.publish()` **awaits delivery to every consumer.**

## Consequences

- `await ctx.publish(...)` means "this event has finished travelling the
  country". Tests, the smoke run and the portal trace are deterministic.
- This is deliberately unlike a production broker, where publish returns before
  consumers run. The NATS adapter behaves the real way, and the difference is
  documented in the transport file itself.
- **This decision was made because of a bug.** The first version did not await:
  `void this.deliver(envelope)`. Delivery then stopped after whichever consumers
  happened to run in the first microtask — an observation reached 6 of its 16
  ministries and nothing failed, nothing logged. The smoke test caught it. A
  regression test now pins it (`packages/events/tests/bus.test.ts`).
- A slow consumer slows the producer. Acceptable: handlers here are local writes.

## Alternatives rejected

**NATS by default.** Correct architecture, wrong cost for the audience. The
adapter exists precisely so the choice can be revisited without touching a
service.

**Fire-and-forget in memory.** What we had. It made the platform's central claim
— that an event reaches everyone who declared an interest — silently false.
