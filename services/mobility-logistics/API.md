# API — Autonomous Mobility & Logistics Grid

Base path: `/api/mobility-logistics` · OpenAPI: `/api/mobility-logistics/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/mobility-logistics/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/mobility-logistics/signals` | What other ministries sent here | platform |
| `GET` | `/api/mobility-logistics/twins` | Digital twins maintained here | platform |
| `GET` | `/api/mobility-logistics/twins/:id` | One twin with history | platform |
| `GET` | `/api/mobility-logistics/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/mobility-logistics/resources` | health | platform |
| `GET` | `/api/mobility-logistics/resources` | list | national-mobility-digital-twin |
| `GET` | `/api/mobility-logistics/resources/:id` | get | national-mobility-digital-twin |
| `GET` | `/api/mobility-logistics/resources/nearest` | The closest available resource to a point. Health, Emergency and Resilience all depend on this. | autonomous-logistics-brain |
| `POST` | `/api/mobility-logistics/dispatch` | Assign the closest available resource to a request and broadcast the assignment. | autonomous-logistics-brain |
| `GET` | `/api/mobility-logistics/flows` | Mobility demand by governorate. | national-mobility-digital-twin |
| `GET` | `/api/mobility-logistics/resources` | signals | platform |
| `GET` | `/api/mobility-logistics/resources` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/mobility-logistics/health
curl http://localhost:4000/api/mobility-logistics/signals
curl "http://localhost:4000/api/mobility-logistics/resources?limit=3"
```
