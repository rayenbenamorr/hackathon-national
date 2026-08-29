# API — Autonomous Food & Water Grid

Base path: `/api/food-water` · OpenAPI: `/api/food-water/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/food-water/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/food-water/signals` | What other ministries sent here | platform |
| `GET` | `/api/food-water/twins` | Digital twins maintained here | platform |
| `GET` | `/api/food-water/twins/:id` | One twin with history | platform |
| `GET` | `/api/food-water/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/food-water/farms` | health | platform |
| `GET` | `/api/food-water/farms` | list | ai-farm-digital-twin |
| `GET` | `/api/food-water/farms/:id` | get | ai-farm-digital-twin |
| `POST` | `/api/food-water/farms` | create | ai-farm-digital-twin |
| `POST` | `/api/food-water/water/demand/forecast` | Forecast water demand for a governorate from soil, weather and crop state. | autonomous-water-grid |
| `POST` | `/api/food-water/water/shortage/predict` | Predict a shortage and alert every ministry that depends on water. | autonomous-water-grid |
| `GET` | `/api/food-water/irrigation/plan` | Water demand by governorate. | autonomous-water-grid |
| `GET` | `/api/food-water/farms` | signals | platform |
| `GET` | `/api/food-water/farms` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/food-water/health
curl http://localhost:4000/api/food-water/signals
curl "http://localhost:4000/api/food-water/farms?limit=3"
```
