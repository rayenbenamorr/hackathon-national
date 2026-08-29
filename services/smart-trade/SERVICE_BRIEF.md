# SERVICE BRIEF — Smart Trade Network

**Ministry:** Commerce & Export
**Service id:** `smart-trade`
**Base path:** `/api/smart-trade`

## What this ministry is for

Give every exported product a verifiable identity, and give the country a map of the dependencies that decide whether it can be produced at all.

## The three modules

### 1. Smart Product Passport

Origin, footprint and certification as a portable record.

`src/modules/smart-product-passport.ts`

### 2. AI Export Copilot

What a producer must do to reach a target market.

`src/modules/ai-export-copilot.ts`

### 3. National Supply Graph

Dependencies between products, inputs and corridors.

`src/modules/national-supply-graph.ts`

## What it owns

Authoritative for: `ProductRef`, `ProductPassportRef`, `ShipmentRef`.

Its own database namespace is `.data/smart-trade.json`, holding the
`products` collection (30 synthetic records seeded on
first start) plus `signals`, `twins` and `aiResults`.

**No other service can read that file through code** — the store API has no way
to name another namespace (`packages/data`). Cross-ministry data moves through
the 4 events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area         | Available here                                                                 |
| ------------ | ------------------------------------------------------------------------------ |
| AI           | market requirement extraction · supply risk propagation · footprint estimation |
| IoT          | cold chain temperature · container GPS · port occupancy                        |
| Digital twin | product twin · corridor twin                                                   |

## Connectivity

15 partner ministries. See `RELATIONS.md`.
