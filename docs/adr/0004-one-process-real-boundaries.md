# ADR-0004 — One process, 24 services, real boundaries

**Status:** accepted · **Date:** 2026-08-28

## Context

§7: keep real logical service boundaries, do **not** create unnecessary
operational complexity. One local stack, simple startup, automated service
discovery, a central gateway, one command.

## Decision

All 24 ministries are hosted **in a single Node process** behind one gateway on
one port. Each is a `ServiceDefinition` registered as a `ServiceEndpoint`; the
SDK dispatches in-process through that registry.

The boundary is enforced by what a service is given, not by a network:

- its own database namespace, unreachable from any other service;
- no import path from one `services/<a>/src` to another (validator rule 4);
- events only through the bus, with contract validation and exclusive ownership;
- synchronous reads only through `ctx.platform`, which is the SDK, which records
  the hop and degrades readably.

`pnpm dev:service <id>` runs one ministry alone, so a team can see and test what
happens when their neighbours are absent.

## Consequences

- Startup is one command and about ten seconds for the whole country.
- The relation graph is exercised for real: 382 relations, all in one process.
- **Discipline is not weaker.** Everything a network boundary would have
  prevented is prevented by the shape of `ServiceContext`.
- It is not a deployment topology. Splitting later means giving the SDK an HTTP
  transport — the interface (`ServiceEndpoint`) already assumes it, which is why
  `PlatformRequest`/`PlatformResponse` are serialisable shapes rather than
  direct function calls.
- One process means one crash surface. Mitigated: a service that fails to boot
  is logged and skipped, the other 23 start; a consumer that throws is isolated;
  `unhandledRejection` is caught.

## Alternatives rejected

**One process per service.** 24 terminals or a process manager, 24 ports, 24
restarts. Nothing is learned that the logical boundary does not already teach.
