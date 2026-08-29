# Architecture decision records

Every decision here materially affects future teams. Each record states what was
decided, what it costs, and what was rejected — because the rejected option is
usually the one a reviewer will propose.

| #                                                     | Decision                                     |
| ----------------------------------------------------- | -------------------------------------------- |
| [0001](0001-node-typescript-no-containers.md)         | Node + TypeScript, and no containers         |
| [0002](0002-single-package-monorepo.md)               | A monorepo that is a single npm package      |
| [0003](0003-json-store-with-an-adapter-seam.md)       | A JSON store behind a `StoreAdapter`         |
| [0004](0004-one-process-real-boundaries.md)           | One process, 24 services, real boundaries    |
| [0005](0005-in-memory-bus-that-awaits-delivery.md)    | An in-memory bus that awaits delivery        |
| [0006](0006-mock-ai-synthesised-from-the-schema.md)   | Mock AI synthesised from the caller's schema |
| [0007](0007-generation-with-two-classes-of-output.md) | Generation, with two classes of output       |
| [0008](0008-relations-implemented-not-documented.md)  | Relations are implemented, not documented    |
| [0009](0009-vanilla-portal-no-build.md)               | A portal with no build step                  |

The thread running through all nine: **the architecture is sophisticated, the
operations are not.** Every place production would need a different component
has a seam — `StoreAdapter`, `EventTransport`, `DeviceAdapter`, `AiProvider`,
`ServiceEndpoint` — and none of those components is installed.
