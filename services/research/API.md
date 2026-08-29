# API — Tunisia Research Brain

Base path: `/api/research` · OpenAPI: `/api/research/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/research/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/research/signals` | What other ministries sent here | platform |
| `GET` | `/api/research/twins` | Digital twins maintained here | platform |
| `GET` | `/api/research/twins/:id` | One twin with history | platform |
| `GET` | `/api/research/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/research/projects` | health | platform |
| `GET` | `/api/research/projects` | list | national-research-brain |
| `GET` | `/api/research/projects/:id` | get | national-research-brain |
| `POST` | `/api/research/projects` | create | national-research-brain |
| `POST` | `/api/research/transfer/match` | Find the research result that answers a stated ministry need. | ai-innovation-transfer-engine |
| `GET` | `/api/research/capability` | Research capability by discipline. | living-lab-tunisia |
| `GET` | `/api/research/projects` | signals | platform |
| `GET` | `/api/research/projects` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/research/health
curl http://localhost:4000/api/research/signals
curl "http://localhost:4000/api/research/projects?limit=3"
```
