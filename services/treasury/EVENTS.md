# EVENTS — Intelligent Treasury OS

Contracts live in `packages/contracts/src/events/treasury.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `treasury.budget-line.updated.v1`

A budget line moved.

| Field | Type |
| --- | --- |
| `lineId` | `string` |
| `programme` | `string` |
| `ministry` | `string` |
| `allocatedTnd` | `number` |
| `committedTnd` | `number` |
| `governorate` | `gov` |
| `updatedAt` | `date` |

Consumed by: `justice`, `education`, `talent`, `land`

### `treasury.funding.approved.v1`

Funding was approved for another ministry request.

| Field | Type |
| --- | --- |
| `approvalId` | `string` |
| `requestedBy` | `string` |
| `amountTnd` | `number` |
| `purpose` | `text` |
| `governorate` | `gov` |
| `approvedAt` | `date` |

Consumed by: `resilience`, `global-tunisia`, `industrial-energy`, `food-water`, `skills-opportunity`, `research`, `religious-heritage`, `digital-nervous-system`, `infrastructure`, `tourism`, `culture`

### `treasury.aid.disbursed.v1`

Targeted aid reached a beneficiary cohort.

| Field | Type |
| --- | --- |
| `disbursementId` | `string` |
| `cohortId` | `string` |
| `amountTnd` | `number` |
| `governorate` | `gov` |
| `beneficiaries` | `int` |
| `disbursedAt` | `date` |

Consumed by: `social-mobility`, `life-care`

### `treasury.fiscal-risk.flagged.v1`

A fiscal risk was detected — over-commitment, shock exposure, revenue gap.

| Field | Type |
| --- | --- |
| `riskId` | `string` |
| `driver` | `string` |
| `exposureTnd` | `number` |
| `governorate` | `gov` |
| `severity` | `enum:low|medium|high` |
| `flaggedAt` | `date` |

Consumed by: `national-digital-twin`, `smart-trade`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `resilience.relief-plan.updated.v1` | resilience | critical | A relief plan is a spending commitment; the treasury twin must see it as it forms. |
| `resilience.resource-request.created.v1` | resilience | critical | Resource requests are funding requests wearing another name. |
| `health.capacity.updated.v1` | health | normal | Saturation is the earliest signal of an unbudgeted health cost. |
| `agriculture.water-shortage.predicted.v1` | food-water | critical | Water shortage has a known fiscal shape: compensation, tankering, import. |
| `infrastructure.failure.predicted.v1` | infrastructure | critical | Predicted failure lets maintenance be budgeted instead of emergency-funded. |
| `infrastructure.maintenance.scheduled.v1` | infrastructure | normal | Scheduled work orders are the committed half of the infrastructure budget. |
| `social.household-need.detected.v1` | social-mobility | critical | Detected need is what the aid wallet exists to answer. |
| `energy.outage-risk.flagged.v1` | industrial-energy | normal | Outage risk carries a subsidy and compensation exposure. |
| `trade.supply-risk.flagged.v1` | smart-trade | normal | Supply risk moves customs revenue and import cost together. |
| `education.program.updated.v1` | education | normal | A new programme is a recurring cost that must enter the fiscal year. |
| `justice.court-load.updated.v1` | justice | normal | Court saturation is the justification for justice budget reallocation. |
| `twin.scenario.completed.v1` | national-digital-twin | critical | Scenario outcomes are costed before they are decided. |
| `emergency.incident.resolved.v1` | safety-emergency | normal | Resolved incidents give the actual cost of response, not the estimate. |
| `land.site-suitability.scored.v1` | land | normal | Public asset valuation and investment siting share the same scores. |
| `research.transfer.matched.v1` | research | normal | A matched transfer is a funding decision waiting to be made. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
