# Examples — National Land Intelligence System

Runnable against a started platform (`pnpm dev`).

## Read

```bash
curl http://localhost:4000/api/land/health
curl "http://localhost:4000/api/land/parcels?limit=5"
curl "http://localhost:4000/api/land/signals?limit=10"
curl http://localhost:4000/api/land/dependencies
curl http://localhost:4000/api/land/twins
```

## Write

```bash
# Every field is optional — omitted fields are filled with synthetic values.
curl -X POST http://localhost:4000/api/land/parcels \
  -H 'content-type: application/json' \
  -d '{}'
```

## Watch an event travel

```bash
# 1. see who is listening
curl http://localhost:4000/__platform/events | grep -A3 'land.parcel.updated.v1'

# 2. trigger something in this ministry, then follow the trace
curl http://localhost:4000/__platform/flows | head -40
```

## Cross-ministry

```bash
# The gateway is the only entry point; every ministry is behind it.
curl http://localhost:4000/__platform/services
curl http://localhost:4000/api/land/openapi.json
```
