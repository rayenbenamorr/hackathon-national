# RELATIONS — Smart Trade Network

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**15 partner ministries** out of 23 (target: 14).
`digital-nervous-system` · `environment` · `food-water` · `global-tunisia` · `health` · `industrial-energy` · `infrastructure` · `justice` · `land` · `mobility-logistics` · `national-digital-twin` · `research` · `resilience` · `skills-opportunity` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| food-water | event | `agriculture.yield.forecast.v1` | critical | Exportable volume of olive oil, dates and cereals is a yield forecast first. |
| food-water | event | `fisheries.stock.updated.v1` | normal | Seafood export capacity follows stock and effort. |
| industrial-energy | event | `industry.production.updated.v1` | critical | The supply graph is built from what plants actually produce. |
| mobility-logistics | event | `logistics.freight.updated.v1` | critical | A shipment without a freight movement is a plan, not a shipment. |
| mobility-logistics | event | `transport.congestion.detected.v1` | normal | Corridor congestion is the most common cause of a missed export window. |
| environment | event | `environment.air-quality.updated.v1` | normal | Carbon and emission context feeds the product passport footprint. |
| infrastructure | event | `infrastructure.asset-health.updated.v1` | critical | Port and rail health is a hard constraint on export capacity. |
| treasury | event | `treasury.fiscal-risk.flagged.v1` | normal | Customs revenue exposure and trade risk are read together. |
| global-tunisia | event | `global.diaspora-signal.updated.v1` | normal | Diaspora demand is a real and under-used export channel. |
| justice | event | `justice.legal-text.published.v1` | normal | Export requirements change when the applicable text changes. |
| research | event | `research.finding.released.v1` | normal | Certification and process results unlock markets that were closed. |
| resilience | event | `resilience.crisis.declared.v1` | normal | A crisis reroutes or blocks corridors and shipments. |
| land | event | `land.zoning.changed.v1` | normal | Industrial zoning determines where production can expand. |
| skills-opportunity | event | `skills.gap.detected.v1` | normal | Certification and quality-control skills gate export readiness. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | critical | Cold-chain temperature and container GPS observations are the shipment twin. |
| health | event | `health.epidemic-signal.detected.v1` | normal | Food and pharmaceutical export controls follow health signals at the border. |
| mobility-logistics | api | `GET /flows` | normal | Corridor state at the moment an export plan is produced. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `trade.supply-risk.flagged.v1` | normal | Commercial disputes rise with supply failures; the workflow pre-positions commercial chambers. |
| global-tunisia | event | `trade.export-opportunity.detected.v1` | critical | Export openings are relayed to diaspora networks in the target market. |
| treasury | event | `trade.supply-risk.flagged.v1` | normal | Supply risk moves customs revenue and import cost together. |
| national-digital-twin | event | `trade.shipment.updated.v1` | normal | Trade flows are the economic exchange term between regions. |
| industrial-energy | event | `trade.supply-risk.flagged.v1` | critical | An input dependency at risk stops a production line. |
| food-water | event | `trade.export-opportunity.detected.v1` | normal | Export demand changes which crops are worth the water. |
| skills-opportunity | event | `trade.export-opportunity.detected.v1` | critical | An export opening is a skill requirement with a deadline. |
| research | event | `trade.supply-risk.flagged.v1` | normal | A supply dependency at risk is a substitution research problem. |
| mobility-logistics | event | `trade.shipment.updated.v1` | critical | Freight planning starts from the shipments that exist. |
| environment | event | `trade.product-passport.issued.v1` | normal | Product footprints and the national inventory must reconcile. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
