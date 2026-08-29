# API — Intelligent Treasury OS

Base path: `/api/treasury` · OpenAPI: `/api/treasury/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/treasury/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/treasury/signals` | What other ministries sent here | platform |
| `GET` | `/api/treasury/twins` | Digital twins maintained here | platform |
| `GET` | `/api/treasury/twins/:id` | One twin with history | platform |
| `GET` | `/api/treasury/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/treasury/budgetLines` | health | platform |
| `GET` | `/api/treasury/budgetLines` | list | real-time-treasury-twin |
| `GET` | `/api/treasury/budgetLines/:id` | get | real-time-treasury-twin |
| `POST` | `/api/treasury/budgetLines` | create | real-time-treasury-twin |
| `POST` | `/api/treasury/budget/optimise` | Propose a reallocation under a stated constraint, with its rationale. | ai-public-budget-optimizer |
| `GET` | `/api/treasury/position` | Commitment rate by ministry. | real-time-treasury-twin |
| `GET` | `/api/treasury/budgetLines` | signals | platform |
| `GET` | `/api/treasury/budgetLines` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/treasury/health
curl http://localhost:4000/api/treasury/signals
curl "http://localhost:4000/api/treasury/budgetLines?limit=3"
```
