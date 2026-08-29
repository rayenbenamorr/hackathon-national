# Connected Health Intelligence System

`health` · Ministry: Health · Base path: `/api/health`

Hospital capacity, epidemic signals and care that reaches beyond the hospital walls.

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
