# API — National Resilience Command System

Base path: `/api/resilience` · OpenAPI: `/api/resilience/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/resilience/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/resilience/signals` | What other ministries sent here | platform |
| `GET` | `/api/resilience/twins` | Digital twins maintained here | platform |
| `GET` | `/api/resilience/twins/:id` | One twin with history | platform |
| `GET` | `/api/resilience/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/resilience/crises` | health | platform |
| `GET` | `/api/resilience/crises` | list | national-resilience-digital-twin |
| `GET` | `/api/resilience/crises/:id` | get | national-resilience-digital-twin |
| `POST` | `/api/resilience/crises` | create | national-resilience-digital-twin |
| `POST` | `/api/resilience/logistics/plan` | Produce a relief plan for a crisis and broadcast it. | autonomous-crisis-logistics |
| `GET` | `/api/resilience/mesh/nodes` | Mesh node reachability by governorate. | emergency-mesh-network |
| `GET` | `/api/resilience/crises` | signals | platform |
| `GET` | `/api/resilience/crises` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/resilience/health
curl http://localhost:4000/api/resilience/signals
curl "http://localhost:4000/api/resilience/crises?limit=3"
```
