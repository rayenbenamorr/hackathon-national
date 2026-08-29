# API — Global Tunisia Network

Base path: `/api/global-tunisia` · OpenAPI: `/api/global-tunisia/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/global-tunisia/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/global-tunisia/signals` | What other ministries sent here | platform |
| `GET` | `/api/global-tunisia/twins` | Digital twins maintained here | platform |
| `GET` | `/api/global-tunisia/twins/:id` | One twin with history | platform |
| `GET` | `/api/global-tunisia/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/global-tunisia/consulates` | health | platform |
| `GET` | `/api/global-tunisia/consulates` | list | ai-consular-twin |
| `GET` | `/api/global-tunisia/consulates/:id` | get | ai-consular-twin |
| `POST` | `/api/global-tunisia/consulates` | create | ai-consular-twin |
| `POST` | `/api/global-tunisia/opportunities/match` | Match a national need to diaspora capability. | global-opportunity-engine |
| `GET` | `/api/global-tunisia/diaspora/stats` | Cohorts and skills by country. | diaspora-intelligence-graph |
| `GET` | `/api/global-tunisia/consulates` | signals | platform |
| `GET` | `/api/global-tunisia/consulates` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/global-tunisia/health
curl http://localhost:4000/api/global-tunisia/signals
curl "http://localhost:4000/api/global-tunisia/consulates?limit=3"
```
