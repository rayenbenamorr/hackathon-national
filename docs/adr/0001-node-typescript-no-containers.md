# ADR-0001 — Node + TypeScript, and no containers

**Status:** accepted · **Date:** 2026-08-28

## Context

The platform must run on 1 200–1 500 student laptops, most of them Windows, many
on a conference network, on the first morning of a six-day event. The brief
(§4, §22, §29) asks for one-command development and explicitly warns against
adding infrastructure because it is fashionable.

Repository reconnaissance found no existing foundation to extend: the sibling
`corporate/` project is an Angular marketing SPA on Supabase and Cloudflare —
strong, unrelated, and the wrong shape for 24 backend services.

## Decision

TypeScript on Node ≥ 20, executed directly by `tsx`. **No Docker, no
Kubernetes, no PostgreSQL, no message broker, no bundler, no build step.**
Dependencies: `zod`, `yaml`, `tsx`, `typescript`, `vitest`, `prettier`. Nothing
with a native compilation step.

## Consequences

- `pnpm install && pnpm dev` genuinely works, offline, on a fresh machine.
- No "it works on my machine" class of failure, because there is only one
  machine configuration: Node.
- Debugging is a stack trace in a terminal, not a container log.
- The cost is honest: this is not how a nation would run 24 services in
  production. Every boundary that production would enforce with a network is
  enforced here in code instead (ADR-0004), and every place production would
  need a different component has an adapter seam (ADR-0003, ADR-0007).

## Alternatives rejected

**Docker Compose per service.** Correct for production, catastrophic here: 24
containers per laptop, image pulls over conference Wi-Fi, and a beginner's first
error message being a networking one.

**A managed cloud environment.** Removes local failure but adds accounts,
quotas, cost, and total dependence on the venue's network.
