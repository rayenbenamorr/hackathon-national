# API — Tunisia National Digital Twin

Base path: `/api/national-digital-twin` · OpenAPI: `/api/national-digital-twin/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/national-digital-twin/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/national-digital-twin/signals` | What other ministries sent here | platform |
| `GET` | `/api/national-digital-twin/twins` | Digital twins maintained here | platform |
| `GET` | `/api/national-digital-twin/twins/:id` | One twin with history | platform |
| `GET` | `/api/national-digital-twin/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/national-digital-twin/regionStates` | health | platform |
| `GET` | `/api/national-digital-twin/regionStates` | list | tunisia-digital-twin |
| `GET` | `/api/national-digital-twin/regionStates/:id` | get | tunisia-digital-twin |
| `POST` | `/api/national-digital-twin/scenarios/run` | Run a cross-sector what-if and broadcast the outcome. | national-scenario-engine |
| `GET` | `/api/national-digital-twin/regions/stress` | Composite stress index per governorate, with the services that drove it. | regional-ai-planner |
| `GET` | `/api/national-digital-twin/regionStates` | signals | platform |
| `GET` | `/api/national-digital-twin/regionStates` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/national-digital-twin/health
curl http://localhost:4000/api/national-digital-twin/signals
curl "http://localhost:4000/api/national-digital-twin/regionStates?limit=3"
```
