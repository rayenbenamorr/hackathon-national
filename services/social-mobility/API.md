# API — Social Mobility OS

Base path: `/api/social-mobility` · OpenAPI: `/api/social-mobility/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/social-mobility/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/social-mobility/signals` | What other ministries sent here | platform |
| `GET` | `/api/social-mobility/twins` | Digital twins maintained here | platform |
| `GET` | `/api/social-mobility/twins/:id` | One twin with history | platform |
| `GET` | `/api/social-mobility/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/social-mobility/cohorts` | health | platform |
| `GET` | `/api/social-mobility/cohorts` | list | social-digital-twin |
| `GET` | `/api/social-mobility/cohorts/:id` | get | social-digital-twin |
| `POST` | `/api/social-mobility/eligibility` | Decide eligibility from signals already held, and explain the decision. | zero-form-social-services |
| `GET` | `/api/social-mobility/vulnerability` | Vulnerability by governorate. | social-mobility-ai |
| `GET` | `/api/social-mobility/cohorts` | signals | platform |
| `GET` | `/api/social-mobility/cohorts` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/social-mobility/health
curl http://localhost:4000/api/social-mobility/signals
curl "http://localhost:4000/api/social-mobility/cohorts?limit=3"
```
