# API — Justice Intelligence OS

Base path: `/api/justice` · OpenAPI: `/api/justice/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/justice/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/justice/signals` | What other ministries sent here | platform |
| `GET` | `/api/justice/twins` | Digital twins maintained here | platform |
| `GET` | `/api/justice/twins/:id` | One twin with history | platform |
| `GET` | `/api/justice/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/justice/cases` | health | platform |
| `GET` | `/api/justice/cases` | list | smart-justice-workflow |
| `GET` | `/api/justice/cases/:id` | get | smart-justice-workflow |
| `POST` | `/api/justice/cases` | create | smart-justice-workflow |
| `POST` | `/api/justice/navigator/ask` | Ask a legal question; answered only from the published texts held by this service. | ai-legal-navigator |
| `GET` | `/api/justice/courts/load` | Pending load and saturation per court. | justice-digital-twin |
| `GET` | `/api/justice/cases` | signals | platform |
| `GET` | `/api/justice/cases` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/justice/health
curl http://localhost:4000/api/justice/signals
curl "http://localhost:4000/api/justice/cases?limit=3"
```
