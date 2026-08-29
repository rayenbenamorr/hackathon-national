# RELATIONS — Intelligent Treasury OS

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**21 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `food-water` · `global-tunisia` · `health` · `industrial-energy` · `infrastructure` · `justice` · `land` · `life-care` · `national-digital-twin` · `religious-heritage` · `research` · `resilience` · `safety-emergency` · `skills-opportunity` · `smart-trade` · `social-mobility` · `talent` · `tourism`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| resilience | event | `resilience.relief-plan.updated.v1` | critical | A relief plan is a spending commitment; the treasury twin must see it as it forms. |
| resilience | event | `resilience.resource-request.created.v1` | critical | Resource requests are funding requests wearing another name. |
| health | event | `health.capacity.updated.v1` | normal | Saturation is the earliest signal of an unbudgeted health cost. |
| food-water | event | `agriculture.water-shortage.predicted.v1` | critical | Water shortage has a known fiscal shape: compensation, tankering, import. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | critical | Predicted failure lets maintenance be budgeted instead of emergency-funded. |
| infrastructure | event | `infrastructure.maintenance.scheduled.v1` | normal | Scheduled work orders are the committed half of the infrastructure budget. |
| social-mobility | event | `social.household-need.detected.v1` | critical | Detected need is what the aid wallet exists to answer. |
| industrial-energy | event | `energy.outage-risk.flagged.v1` | normal | Outage risk carries a subsidy and compensation exposure. |
| smart-trade | event | `trade.supply-risk.flagged.v1` | normal | Supply risk moves customs revenue and import cost together. |
| education | event | `education.program.updated.v1` | normal | A new programme is a recurring cost that must enter the fiscal year. |
| justice | event | `justice.court-load.updated.v1` | normal | Court saturation is the justification for justice budget reallocation. |
| national-digital-twin | event | `twin.scenario.completed.v1` | critical | Scenario outcomes are costed before they are decided. |
| safety-emergency | event | `emergency.incident.resolved.v1` | normal | Resolved incidents give the actual cost of response, not the estimate. |
| land | event | `land.site-suitability.scored.v1` | normal | Public asset valuation and investment siting share the same scores. |
| research | event | `research.transfer.matched.v1` | normal | A matched transfer is a funding decision waiting to be made. |
| national-digital-twin | api | `GET /regions/stress` | normal | Regional stress is the allocation key the optimiser argues from. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `treasury.budget-line.updated.v1` | normal | Court staffing and digitisation move with the justice budget line. |
| resilience | event | `treasury.funding.approved.v1` | normal | A relief plan is only real once its funding is approved. |
| global-tunisia | event | `treasury.funding.approved.v1` | normal | Funded programmes are the opportunities worth publishing abroad. |
| national-digital-twin | event | `treasury.fiscal-risk.flagged.v1` | normal | A fiscal constraint bounds which scenario outcomes are reachable. |
| social-mobility | event | `treasury.aid.disbursed.v1` | critical | Vulnerability must fall when aid actually lands; that loop must be closed. |
| industrial-energy | event | `treasury.funding.approved.v1` | normal | Industrial and renewable programmes move with approved funding. |
| smart-trade | event | `treasury.fiscal-risk.flagged.v1` | normal | Customs revenue exposure and trade risk are read together. |
| food-water | event | `treasury.funding.approved.v1` | normal | Irrigation programmes and compensation move with approved funding. |
| skills-opportunity | event | `treasury.funding.approved.v1` | normal | A funded programme is a hiring plan. |
| education | event | `treasury.budget-line.updated.v1` | normal | Class sizes and equipment follow the education budget line. |
| research | event | `treasury.funding.approved.v1` | critical | A research project without approved funding is a proposal. |
| talent | event | `treasury.budget-line.updated.v1` | normal | Facility maintenance and youth programmes follow the budget line. |
| religious-heritage | event | `treasury.funding.approved.v1` | normal | Restoration programmes exist only once funded. |
| digital-nervous-system | event | `treasury.funding.approved.v1` | normal | Coverage extension programmes follow approved funding. |
| infrastructure | event | `treasury.funding.approved.v1` | critical | A maintenance order without funding is a wish. |
| land | event | `treasury.budget-line.updated.v1` | normal | Public asset valuation and the budget move together. |
| tourism | event | `treasury.funding.approved.v1` | normal | Destination promotion and site upgrades exist once funded. |
| life-care | event | `treasury.aid.disbursed.v1` | critical | Aid arrival is the event that changes an independence trajectory. |
| culture | event | `treasury.funding.approved.v1` | critical | Restoration and creative programmes exist once funded. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
