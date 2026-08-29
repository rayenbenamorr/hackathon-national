# API — Tunisia Immersive Tourism OS

Base path: `/api/tourism` · OpenAPI: `/api/tourism/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/tourism/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/tourism/signals` | What other ministries sent here | platform |
| `GET` | `/api/tourism/twins` | Digital twins maintained here | platform |
| `GET` | `/api/tourism/twins/:id` | One twin with history | platform |
| `GET` | `/api/tourism/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/tourism/sites` | health | platform |
| `GET` | `/api/tourism/sites` | list | tourism-digital-twin |
| `GET` | `/api/tourism/sites/:id` | get | tourism-digital-twin |
| `POST` | `/api/tourism/sites` | create | tourism-digital-twin |
| `POST` | `/api/tourism/itinerary` | Build an itinerary that avoids saturated sites and bad air days. | ai-tourism-flow-engine |
| `GET` | `/api/tourism/flows` | Visitor pressure by governorate. | tourism-digital-twin |
| `GET` | `/api/tourism/sites` | signals | platform |
| `GET` | `/api/tourism/sites` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/tourism/health
curl http://localhost:4000/api/tourism/signals
curl "http://localhost:4000/api/tourism/sites?limit=3"
```
