# API — Tunisia Cultural Intelligence Network

Base path: `/api/culture` · OpenAPI: `/api/culture/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/culture/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/culture/signals` | What other ministries sent here | platform |
| `GET` | `/api/culture/twins` | Digital twins maintained here | platform |
| `GET` | `/api/culture/twins/:id` | One twin with history | platform |
| `GET` | `/api/culture/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/culture/assets` | health | platform |
| `GET` | `/api/culture/assets` | list | tunisia-cultural-digital-twin |
| `GET` | `/api/culture/assets/:id` | get | tunisia-cultural-digital-twin |
| `POST` | `/api/culture/assets` | create | tunisia-cultural-digital-twin |
| `POST` | `/api/culture/events/plan` | Plan a cultural event and warn the ministries whose load it will change. | creative-economy-ai-network |
| `GET` | `/api/culture/assets/condition` | Cultural asset condition by governorate. | tunisia-cultural-digital-twin |
| `GET` | `/api/culture/assets` | signals | platform |
| `GET` | `/api/culture/assets` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/culture/health
curl http://localhost:4000/api/culture/signals
curl "http://localhost:4000/api/culture/assets?limit=3"
```
