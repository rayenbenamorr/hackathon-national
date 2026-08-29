# API — Adaptive Education OS

Base path: `/api/education` · OpenAPI: `/api/education/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/education/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/education/signals` | What other ministries sent here | platform |
| `GET` | `/api/education/twins` | Digital twins maintained here | platform |
| `GET` | `/api/education/twins/:id` | One twin with history | platform |
| `GET` | `/api/education/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/education/schools` | health | platform |
| `GET` | `/api/education/schools` | list | smart-school-iot |
| `GET` | `/api/education/schools/:id` | get | smart-school-iot |
| `POST` | `/api/education/schools` | create | smart-school-iot |
| `POST` | `/api/education/programs/adapt` | Propose a programme adaptation against a national need. | national-knowledge-graph |
| `GET` | `/api/education/schools/condition` | School condition by governorate. | smart-school-iot |
| `GET` | `/api/education/schools` | signals | platform |
| `GET` | `/api/education/schools` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/education/health
curl http://localhost:4000/api/education/signals
curl "http://localhost:4000/api/education/schools?limit=3"
```
