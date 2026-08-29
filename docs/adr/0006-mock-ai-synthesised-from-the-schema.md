# ADR-0006 — Mock AI synthesised from the caller's schema

**Status:** accepted · **Date:** 2026-08-28

## Context

§13: "The entire platform must work without requiring students to possess paid
API keys." A mock that returns a canned string satisfies the letter of that and
breaks the first demo, because student code expects a _shape_.

## Decision

`ctx.ai.structured(schema, prompt)` in mock mode does not fake a language model.
It **walks the zod schema and synthesises a valid value** for every branch,
deterministically seeded by the prompt.

Two refinements, both from failures observed while building:

1. **The schema wins over field-name heuristics.** `z.number().int()` must
   produce an integer, `.min(0).max(1)` must stay in range, `z.enum` must pick a
   member. The first version used only field names and published
   `affectedFarms: 33.7` — which the event contract correctly rejected.
2. **`hints` carries the caller's input through.** Without it, a forecast
   requested for Kairouan came back about a random governorate: valid, and
   obviously wrong to anyone watching a demo. Any input field whose name matches
   an output field is carried over, and only if the result still validates.

Embeddings are a hashed bag-of-words. Not semantic, but lexical — so RAG
demonstrably retrieves the right paragraph offline.

## Consequences

- Every AI feature works on a plane, with no key, and never fails a schema.
- Mock answers are labelled as mock, in the response (`mock: true`), in the
  text, and in the portal. Nobody is fooled.
- Real providers are one env var away, and a real model that drifts from the
  schema falls back to a synthesised value rather than breaking a demo.
- Mock output is plausible, not intelligent. It is a _shape_ generator; the
  reasoning is what a key buys.

## Alternatives rejected

**A small local model.** Hundreds of megabytes per laptop, slow on integrated
graphics, and still no schema guarantee.

**Requiring a key.** Excludes students who cannot pay and makes a shared budget
a single point of failure.
