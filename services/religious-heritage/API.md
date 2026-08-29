# API — Smart Religious Heritage Network

Base path: `/api/religious-heritage` · OpenAPI: `/api/religious-heritage/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/religious-heritage/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/religious-heritage/signals` | What other ministries sent here | platform |
| `GET` | `/api/religious-heritage/twins` | Digital twins maintained here | platform |
| `GET` | `/api/religious-heritage/twins/:id` | One twin with history | platform |
| `GET` | `/api/religious-heritage/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/religious-heritage/sites` | health | platform |
| `GET` | `/api/religious-heritage/sites` | list | smart-heritage-sensor-network |
| `GET` | `/api/religious-heritage/sites/:id` | get | smart-heritage-sensor-network |
| `POST` | `/api/religious-heritage/sites` | create | smart-heritage-sensor-network |
| `POST` | `/api/religious-heritage/knowledge/ask` | Answer only from registered sources, and say when there are none. | trusted-knowledge-graph |
| `GET` | `/api/religious-heritage/sites/condition` | Site condition by governorate. | smart-heritage-sensor-network |
| `GET` | `/api/religious-heritage/sites` | signals | platform |
| `GET` | `/api/religious-heritage/sites` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/religious-heritage/health
curl http://localhost:4000/api/religious-heritage/signals
curl "http://localhost:4000/api/religious-heritage/sites?limit=3"
```
