# API — Environmental Nervous System

Base path: `/api/environment` · OpenAPI: `/api/environment/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/environment/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/environment/signals` | What other ministries sent here | platform |
| `GET` | `/api/environment/twins` | Digital twins maintained here | platform |
| `GET` | `/api/environment/twins/:id` | One twin with history | platform |
| `GET` | `/api/environment/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/environment/stations` | health | platform |
| `GET` | `/api/environment/stations` | list | national-environmental-sensor-network |
| `GET` | `/api/environment/stations/:id` | get | national-environmental-sensor-network |
| `POST` | `/api/environment/stations` | create | national-environmental-sensor-network |
| `GET` | `/api/environment/air-quality` | Air quality by governorate. | national-environmental-sensor-network |
| `POST` | `/api/environment/climate/projection` | Project climate risk for a governorate and warn the ministries it constrains. | climate-digital-twin |
| `GET` | `/api/environment/stations` | signals | platform |
| `GET` | `/api/environment/stations` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/environment/health
curl http://localhost:4000/api/environment/signals
curl "http://localhost:4000/api/environment/stations?limit=3"
```
