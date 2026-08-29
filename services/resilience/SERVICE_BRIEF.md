# SERVICE BRIEF — National Resilience Command System

**Ministry:** Interior / Civil Protection
**Service id:** `resilience`
**Base path:** `/api/resilience`

## What this ministry is for

Hold one shared picture of a crisis across every ministry, and turn it into a relief plan with named resources — because in a crisis the failure is almost never lack of resources, it is lack of a shared picture.

## The three modules

### 1. National Resilience Digital Twin

Live state of every declared crisis and the zones it covers.

`src/modules/national-resilience-digital-twin.ts`

### 2. Autonomous Crisis Logistics

Turns needs into a resourced, sequenced relief plan.

`src/modules/autonomous-crisis-logistics.ts`

### 3. Emergency Mesh Network

Store-and-forward node health when normal connectivity is gone.

`src/modules/emergency-mesh-network.ts`

## What it owns

Authoritative for: `CrisisRef`, `ReliefPlanRef`, `MeshNodeRef`.

Its own database namespace is `.data/resilience.json`, holding the
`crises` collection (8 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------- |
| AI           | relief planning under constraint · crisis severity classification · multi-hazard scenario agent |
| IoT          | mesh node telemetry · water level · rainfall · wind speed                                       |
| Digital twin | crisis twin per event · governorate resilience twin                                             |

## Connectivity

19 partner ministries. See `RELATIONS.md`.
