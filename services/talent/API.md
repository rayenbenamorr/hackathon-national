# API — National Talent Intelligence Network

Base path: `/api/talent` · OpenAPI: `/api/talent/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/talent/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/talent/signals` | What other ministries sent here | platform |
| `GET` | `/api/talent/twins` | Digital twins maintained here | platform |
| `GET` | `/api/talent/twins/:id` | One twin with history | platform |
| `GET` | `/api/talent/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/talent/facilities` | health | platform |
| `GET` | `/api/talent/facilities` | list | smart-sports-infrastructure-grid |
| `GET` | `/api/talent/facilities/:id` | get | smart-sports-infrastructure-grid |
| `POST` | `/api/talent/facilities` | create | smart-sports-infrastructure-grid |
| `POST` | `/api/talent/talent/scout` | Assess a cohort load profile and flag injury risk. | athlete-digital-twin |
| `GET` | `/api/talent/facilities/usage` | Facility usage by governorate. | smart-sports-infrastructure-grid |
| `GET` | `/api/talent/facilities` | signals | platform |
| `GET` | `/api/talent/facilities` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/talent/health
curl http://localhost:4000/api/talent/signals
curl "http://localhost:4000/api/talent/facilities?limit=3"
```
