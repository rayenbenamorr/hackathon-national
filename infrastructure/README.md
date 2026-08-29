# infrastructure/

**This folder is deliberately almost empty, and that is the decision.**

The founding brief asks for an `infrastructure/` directory (§6) and, four
sections later (§29), asks not to introduce infrastructure because it is
fashionable. Both are honoured here: the folder exists as the place where an
operator would put deployment concerns, and there is nothing to deploy because
the platform runs as one process with one command.

## The local stack, in full

```bash
pnpm install
pnpm dev
```

That is the entire infrastructure. Concretely:

| Concern             | How it is handled                            | Where                          |
| ------------------- | -------------------------------------------- | ------------------------------ |
| Service discovery   | in-process registry, populated at boot       | `packages/sdk/src/registry.ts` |
| API gateway         | one HTTP server, `/api/<ministry>/*`         | `apps/api-gateway/`            |
| Message broker      | in-memory bus (NATS adapter present, opt-in) | `packages/events/`             |
| Database            | one JSON file per service under `.data/`     | `packages/data/`               |
| Configuration       | `.env`, read by a 30-line loader             | `packages/runtime/src/env.ts`  |
| Observability       | in-memory rings + `/__platform/*`            | `packages/observability/`      |
| Process supervision | none needed — one process                    | `apps/api-gateway/src/main.ts` |

There is no Dockerfile, no compose file, no Helm chart, no Terraform. Adding any
of them would move the first failure a student meets from _their own code_ to
_someone else's tooling_, on the first morning, 1 500 times over.

## What goes here when this leaves the hackathon

The seams are already in the code, so productionising is adapter work rather
than a rewrite:

| To change                          | Implement                              | Nothing else changes        |
| ---------------------------------- | -------------------------------------- | --------------------------- |
| PostgreSQL, one schema per service | a `StoreAdapter`                       | all 24 services             |
| A real broker                      | an `EventTransport` (NATS one exists)  | every producer and consumer |
| Services on separate hosts         | an HTTP `ServiceEndpoint`              | the SDK's callers           |
| Real devices                       | a `DeviceAdapter` (HTTP ingest exists) | the ingest path             |
| A different model provider         | an `AiProvider`                        | every AI feature            |

The reasoning for each is in [`../docs/adr/`](../docs/adr/).

## Environment variables

Every one of them has a safe default; the platform runs with no `.env` at all.
See [`../.env.example`](../.env.example) for the annotated list.
