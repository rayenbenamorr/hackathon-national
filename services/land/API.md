# API — National Land Intelligence System

Base path: `/api/land` · OpenAPI: `/api/land/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/land/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/land/signals` | What other ministries sent here | platform |
| `GET` | `/api/land/twins` | Digital twins maintained here | platform |
| `GET` | `/api/land/twins/:id` | One twin with history | platform |
| `GET` | `/api/land/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/land/parcels` | health | platform |
| `GET` | `/api/land/parcels` | list | tunisia-land-digital-twin |
| `GET` | `/api/land/parcels/:id` | get | tunisia-land-digital-twin |
| `POST` | `/api/land/parcels` | create | tunisia-land-digital-twin |
| `POST` | `/api/land/siting/evaluate` | Score a parcel for a proposed use against water, risk, mobility and environment constraints. | ai-site-planner |
| `GET` | `/api/land/parcels/pressure` | Land pressure by governorate. | public-asset-intelligence |
| `GET` | `/api/land/parcels` | signals | platform |
| `GET` | `/api/land/parcels` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/land/health
curl http://localhost:4000/api/land/signals
curl "http://localhost:4000/api/land/parcels?limit=3"
```
