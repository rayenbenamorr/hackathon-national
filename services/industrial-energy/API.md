# API — Industrial & Energy Intelligence Grid

Base path: `/api/industrial-energy` · OpenAPI: `/api/industrial-energy/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/industrial-energy/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/industrial-energy/signals` | What other ministries sent here | platform |
| `GET` | `/api/industrial-energy/twins` | Digital twins maintained here | platform |
| `GET` | `/api/industrial-energy/twins/:id` | One twin with history | platform |
| `GET` | `/api/industrial-energy/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/industrial-energy/assets` | health | platform |
| `GET` | `/api/industrial-energy/assets` | list | industrial-digital-twin-network |
| `GET` | `/api/industrial-energy/assets/:id` | get | industrial-digital-twin-network |
| `POST` | `/api/industrial-energy/assets` | create | industrial-digital-twin-network |
| `POST` | `/api/industrial-energy/symbiosis/match` | Find a use for a waste stream in another plant. | ai-industrial-symbiosis |
| `GET` | `/api/industrial-energy/grid/load` | Load and renewable share by governorate. | energy-internet |
| `GET` | `/api/industrial-energy/assets` | signals | platform |
| `GET` | `/api/industrial-energy/assets` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/industrial-energy/health
curl http://localhost:4000/api/industrial-energy/signals
curl "http://localhost:4000/api/industrial-energy/assets?limit=3"
```
