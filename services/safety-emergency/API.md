# API — National Safety & Emergency Grid

Base path: `/api/safety-emergency` · OpenAPI: `/api/safety-emergency/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/safety-emergency/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/safety-emergency/signals` | What other ministries sent here | platform |
| `GET` | `/api/safety-emergency/twins` | Digital twins maintained here | platform |
| `GET` | `/api/safety-emergency/twins/:id` | One twin with history | platform |
| `GET` | `/api/safety-emergency/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/safety-emergency/incidents` | health | platform |
| `GET` | `/api/safety-emergency/incidents` | list | national-emergency-brain |
| `GET` | `/api/safety-emergency/incidents/:id` | get | national-emergency-brain |
| `POST` | `/api/safety-emergency/incidents` | create | national-emergency-brain |
| `POST` | `/api/safety-emergency/triage` | Classify an incoming report and say what to dispatch. | national-emergency-brain |
| `GET` | `/api/safety-emergency/road-risk` | Road risk by governorate, blending incidents with weather and traffic signals. | ai-road-safety-grid |
| `GET` | `/api/safety-emergency/incidents` | signals | platform |
| `GET` | `/api/safety-emergency/incidents` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/safety-emergency/health
curl http://localhost:4000/api/safety-emergency/signals
curl "http://localhost:4000/api/safety-emergency/incidents?limit=3"
```
