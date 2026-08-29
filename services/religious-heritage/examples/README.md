# Examples — Smart Religious Heritage Network

Runnable against a started platform (`pnpm dev`).

## Read

```bash
curl http://localhost:4000/api/religious-heritage/health
curl "http://localhost:4000/api/religious-heritage/sites?limit=5"
curl "http://localhost:4000/api/religious-heritage/signals?limit=10"
curl http://localhost:4000/api/religious-heritage/dependencies
curl http://localhost:4000/api/religious-heritage/twins
```

## Write

```bash
# Every field is optional — omitted fields are filled with synthetic values.
curl -X POST http://localhost:4000/api/religious-heritage/sites \
  -H 'content-type: application/json' \
  -d '{}'
```

## Watch an event travel

```bash
# 1. see who is listening
curl http://localhost:4000/__platform/events | grep -A3 'heritage.site-condition.updated.v1'

# 2. trigger something in this ministry, then follow the trace
curl http://localhost:4000/__platform/flows | head -40
```

## Cross-ministry

```bash
# The gateway is the only entry point; every ministry is behind it.
curl http://localhost:4000/__platform/services
curl http://localhost:4000/api/religious-heritage/openapi.json
```
