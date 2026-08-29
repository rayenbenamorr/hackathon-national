# API — National Skills & Opportunity OS

Base path: `/api/skills-opportunity` · OpenAPI: `/api/skills-opportunity/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/skills-opportunity/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/skills-opportunity/signals` | What other ministries sent here | platform |
| `GET` | `/api/skills-opportunity/twins` | Digital twins maintained here | platform |
| `GET` | `/api/skills-opportunity/twins/:id` | One twin with history | platform |
| `GET` | `/api/skills-opportunity/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/skills-opportunity/skills` | health | platform |
| `GET` | `/api/skills-opportunity/skills` | list | national-skills-graph |
| `GET` | `/api/skills-opportunity/skills/:id` | get | national-skills-graph |
| `POST` | `/api/skills-opportunity/skills` | create | national-micro-mission-network |
| `POST` | `/api/skills-opportunity/career/plan` | Build a training path from a current profile to real regional demand. | ai-career-digital-twin |
| `GET` | `/api/skills-opportunity/gaps` | Skill gaps by governorate. | national-skills-graph |
| `GET` | `/api/skills-opportunity/skills` | signals | platform |
| `GET` | `/api/skills-opportunity/skills` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/skills-opportunity/health
curl http://localhost:4000/api/skills-opportunity/signals
curl "http://localhost:4000/api/skills-opportunity/skills?limit=3"
```
