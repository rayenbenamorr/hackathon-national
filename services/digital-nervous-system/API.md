# API — Tunisia Digital Nervous System

Base path: `/api/digital-nervous-system` · OpenAPI: `/api/digital-nervous-system/openapi.json`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| `GET` | `/api/digital-nervous-system/health` | Liveness, holdings, AI mode | platform |
| `GET` | `/api/digital-nervous-system/signals` | What other ministries sent here | platform |
| `GET` | `/api/digital-nervous-system/twins` | Digital twins maintained here | platform |
| `GET` | `/api/digital-nervous-system/twins/:id` | One twin with history | platform |
| `GET` | `/api/digital-nervous-system/dependencies` | Live status of outgoing integrations | platform |
| `GET` | `/api/digital-nervous-system/sensors` | health | platform |
| `GET` | `/api/digital-nervous-system/sensors` | list | sovereign-iot-fabric |
| `GET` | `/api/digital-nervous-system/sensors/:id` | get | sovereign-iot-fabric |
| `POST` | `/api/digital-nervous-system/sensors/observations` | The national sensor ingest endpoint. Real devices and the simulator both POST here. | sovereign-iot-fabric |
| `GET` | `/api/digital-nervous-system/registry/services` | Every running ministry service and its routes. | national-digital-identity-event-bus |
| `GET` | `/api/digital-nervous-system/registry/events` | The full event catalogue with owners and subscribers. | national-digital-identity-event-bus |
| `GET` | `/api/digital-nervous-system/sensors/coverage` | Sensor coverage by governorate. | tunisia-edge-ai-mesh |
| `GET` | `/api/digital-nervous-system/sensors` | signals | platform |
| `GET` | `/api/digital-nervous-system/sensors` | twins | platform |

## Try it

```bash
curl http://localhost:4000/api/digital-nervous-system/health
curl http://localhost:4000/api/digital-nervous-system/signals
curl "http://localhost:4000/api/digital-nervous-system/sensors?limit=3"
```
