# Examples — Adaptive Education OS

Runnable against a started platform (`pnpm dev`).

## Read

```bash
curl http://localhost:4000/api/education/health
curl "http://localhost:4000/api/education/schools?limit=5"
curl "http://localhost:4000/api/education/signals?limit=10"
curl http://localhost:4000/api/education/dependencies
curl http://localhost:4000/api/education/twins
```

## Write

```bash
# Every field is optional — omitted fields are filled with synthetic values.
curl -X POST http://localhost:4000/api/education/schools \
  -H 'content-type: application/json' \
  -d '{}'
```

## Watch an event travel

```bash
# 1. see who is listening
curl http://localhost:4000/__platform/events | grep -A3 'education.learning-progress.updated.v1'

# 2. trigger something in this ministry, then follow the trace
curl http://localhost:4000/__platform/flows | head -40
```

## Cross-ministry

```bash
# The gateway is the only entry point; every ministry is behind it.
curl http://localhost:4000/__platform/services
curl http://localhost:4000/api/education/openapi.json
```
