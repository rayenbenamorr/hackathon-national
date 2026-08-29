# API — Connected Health Intelligence System

Base path: `/api/health` · OpenAPI: `/api/health/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/health/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/health/signals` | What other ministries sent here | platform |
| `GET` | `/api/health/twins` | Digital twins maintained here | platform |
| `GET` | `/api/health/twins/:id` | One twin with history | platform |
| `GET` | `/api/health/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/health/facilities` | health | platform |
| `GET` | `/api/health/facilities` | list | smart-hospital-operating-system |
| `GET` | `/api/health/facilities/:id` | get | smart-hospital-operating-system |
| `GET` | `/api/health/capacity` | Capacity by governorate. The endpoint every dispatcher calls. | smart-hospital-operating-system |
| `POST` | `/api/health/triage` | Assess a case description and name the facility type it needs. | healthcare-mesh |
| `POST` | `/api/health/epidemic/scan` | Scan cohort and environmental signals for an emerging epidemic pattern. | personal-health-digital-twin |
| `GET` | `/api/health/facilities` | signals | platform |
| `GET` | `/api/health/facilities` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/health/health
curl http://localhost:4000/api/health/signals
curl "http://localhost:4000/api/health/facilities?limit=3"
```
