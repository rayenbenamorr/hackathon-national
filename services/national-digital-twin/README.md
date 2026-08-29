# Tunisia National Digital Twin

`national-digital-twin` · Ministry: Planning / Prime Ministry · Base path: `/api/national-digital-twin`

The country as one queryable model, assembled from what the other 23 publish.

| Document                                         | What it is for                                             |
| ------------------------------------------------ | ---------------------------------------------------------- |
| [`STUDENT_GUIDE.md`](STUDENT_GUIDE.md)           | **Start here.** How to run it and what to ask Claude Code. |
| [`SERVICE_BRIEF.md`](SERVICE_BRIEF.md)           | The mission, the three modules, what this ministry owns.   |
| [`RELATIONS.md`](RELATIONS.md)                   | Every other ministry this one is connected to, and why.    |
| [`API.md`](API.md)                               | Endpoints.                                                 |
| [`EVENTS.md`](EVENTS.md)                         | Events published and consumed.                             |
| [`service.manifest.yaml`](service.manifest.yaml) | Machine-readable manifest — what Claude Code reads first.  |

```
src/
  index.ts        the service definition
  domain.ts       the shapes this ministry owns
  routes.ts       endpoint declarations
  modules/        the three modules — where the logic lives
  consumers.ts    incoming events from other ministries
  adapters.ts     outgoing calls to other ministries
  seed.ts         synthetic data
tests/            contract and relation tests
examples/         runnable request samples
```

Everything under `src/` is yours to edit. `pnpm generate` never overwrites it.
