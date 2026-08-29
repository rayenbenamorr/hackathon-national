# SERVICE BRIEF — Tunisia Digital Nervous System

**Ministry:** Digital Economy & Communication Technologies
**Service id:** `digital-nervous-system`
**Base path:** `/api/digital-nervous-system`

## What this ministry is for

Be the layer nobody thinks about because it never fails: every sensor observation in the country enters here and reaches whichever ministries care, without any of them knowing the others exist.

## The three modules

### 1. Tunisia Edge AI Mesh

Edge node health and locally-processed inference.

`src/modules/tunisia-edge-ai-mesh.ts`

### 2. Sovereign IoT Fabric

Sensor registry and the single national ingest endpoint.

`src/modules/sovereign-iot-fabric.ts`

### 3. National Digital Identity + Event Bus

Service registry, event catalogue, pseudonymous identity.

`src/modules/national-digital-identity-event-bus.ts`

## What it owns

Authoritative for: `SensorRef`, `SensorObservation`, `EdgeNodeRef`, `EventCatalog`.

Its own database namespace is `.data/digital-nervous-system.json`, holding the
`sensors` collection (0 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                     |
| ------------ | -------------------------------------------------- |
| AI           | edge inference routing · sensor fault detection    |
| IoT          | all 16 sensor kinds — this service owns the fabric |
| Digital twin | sensor network twin · edge node twin               |

## Connectivity

19 partner ministries. See `RELATIONS.md`.
