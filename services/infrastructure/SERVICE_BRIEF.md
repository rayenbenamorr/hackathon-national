# SERVICE BRIEF — Smart Infrastructure OS

**Ministry:** Equipment & Housing
**Service id:** `infrastructure`
**Base path:** `/api/infrastructure`

## What this ministry is for

Replace inspection cycles with condition: every bridge, network and building carries a health score other ministries can plan against.

## The three modules

### 1. National Infrastructure Digital Twin

Health per asset, continuously.

`src/modules/national-infrastructure-digital-twin.ts`

### 2. Predictive Infrastructure Maintenance

Failure prediction and work orders.

`src/modules/predictive-infrastructure-maintenance.ts`

### 3. Autonomous Smart Housing

Public housing comfort, energy and water.

`src/modules/autonomous-smart-housing.ts`

## What it owns

Authoritative for: `InfrastructureAssetRef`, `MaintenanceOrderRef`, `HousingUnitRef`.

Its own database namespace is `.data/infrastructure.json`, holding the
`assets` collection (46 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 3 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                             |
| ------------ | -------------------------------------------------------------------------- |
| AI           | failure prediction · maintenance prioritisation · strain anomaly detection |
| IoT          | vibration · structural strain · water level · energy load · temperature    |
| Digital twin | asset twin · network twin                                                  |

## Connectivity

20 partner ministries. See `RELATIONS.md`.
