# API — Smart Infrastructure OS

Base path: `/api/infrastructure` · OpenAPI: `/api/infrastructure/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/infrastructure/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/infrastructure/signals` | What other ministries sent here | platform |
| `GET` | `/api/infrastructure/twins` | Digital twins maintained here | platform |
| `GET` | `/api/infrastructure/twins/:id` | One twin with history | platform |
| `GET` | `/api/infrastructure/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/infrastructure/assets` | health | platform |
| `GET` | `/api/infrastructure/assets` | list | national-infrastructure-digital-twin |
| `GET` | `/api/infrastructure/assets/:id` | get | national-infrastructure-digital-twin |
| `POST` | `/api/infrastructure/assets` | create | national-infrastructure-digital-twin |
| `POST` | `/api/infrastructure/maintenance/predict` | Predict failure for an asset and warn everyone downstream of it. | predictive-infrastructure-maintenance |
| `GET` | `/api/infrastructure/assets/health` | Asset health by governorate. | national-infrastructure-digital-twin |
| `GET` | `/api/infrastructure/assets` | signals | platform |
| `GET` | `/api/infrastructure/assets` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/infrastructure/health
curl http://localhost:4000/api/infrastructure/signals
curl "http://localhost:4000/api/infrastructure/assets?limit=3"
```
