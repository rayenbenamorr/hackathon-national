# API — Life & Care Intelligence OS

Base path: `/api/life-care` · OpenAPI: `/api/life-care/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/life-care/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/life-care/signals` | What other ministries sent here | platform |
| `GET` | `/api/life-care/twins` | Digital twins maintained here | platform |
| `GET` | `/api/life-care/twins/:id` | One twin with history | platform |
| `GET` | `/api/life-care/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/life-care/facilities` | health | platform |
| `GET` | `/api/life-care/facilities` | list | smart-care-network |
| `GET` | `/api/life-care/facilities/:id` | get | smart-care-network |
| `POST` | `/api/life-care/facilities` | create | smart-care-network |
| `POST` | `/api/life-care/life-event` | Record a life event and infer the support it should trigger. | life-journey-ai |
| `GET` | `/api/life-care/coverage` | Care coverage by governorate. | economic-independence-engine |
| `GET` | `/api/life-care/facilities` | signals | platform |
| `GET` | `/api/life-care/facilities` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/life-care/health
curl http://localhost:4000/api/life-care/signals
curl "http://localhost:4000/api/life-care/facilities?limit=3"
```
