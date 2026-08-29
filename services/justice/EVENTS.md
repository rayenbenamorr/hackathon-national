# EVENTS — Justice Intelligence OS

Contracts live in `packages/contracts/src/events/justice.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `justice.case.filed.v1`

A new case entered the system.

| Field | Type |
| --- | --- |
| `caseId` | `string` |
| `matter` | `string` |
| `court` | `string` |
| `governorate` | `gov` |
| `filedAt` | `date` |

Consumed by: `social-mobility`, `life-care`

### `justice.case.decided.v1`

A case reached a decision.

| Field | Type |
| --- | --- |
| `caseId` | `string` |
| `matter` | `string` |
| `durationDays` | `int` |
| `governorate` | `gov` |
| `decidedAt` | `date` |

Consumed by: _nobody yet_

### `justice.court-load.updated.v1`

Pending load and saturation for a court.

| Field | Type |
| --- | --- |
| `court` | `string` |
| `governorate` | `gov` |
| `pendingCases` | `int` |
| `saturation` | `unit` |
| `averageDelayDays` | `int` |
| `observedAt` | `date` |

Consumed by: `treasury`

### `justice.legal-text.published.v1`

A legal text became applicable — other ministries may need to adapt.

| Field | Type |
| --- | --- |
| `textId` | `string` |
| `title` | `string` |
| `domain` | `string` |
| `effectiveFrom` | `date` |
| `summary` | `text` |

Consumed by: `global-tunisia`, `smart-trade`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `emergency.incident.created.v1` | safety-emergency | normal | A serious incident becomes a case file; opening it from the incident removes a manual re-entry step. |
| `land.zoning.changed.v1` | land | normal | Zoning changes are the single largest generator of land disputes; the court twin anticipates the load. |
| `land.parcel.updated.v1` | land | normal | Parcel records are evidence in property cases and must be current when a case is heard. |
| `social.vulnerability.updated.v1` | social-mobility | normal | Legal aid is targeted at the cohorts that cannot otherwise reach a court. |
| `treasury.budget-line.updated.v1` | treasury | normal | Court staffing and digitisation move with the justice budget line. |
| `trade.supply-risk.flagged.v1` | smart-trade | normal | Commercial disputes rise with supply failures; the workflow pre-positions commercial chambers. |
| `resilience.crisis.declared.v1` | resilience | critical | A declared crisis suspends deadlines and moves hearings — the workflow must know immediately. |
| `health.epidemic-signal.detected.v1` | health | normal | Hearing continuity plans depend on health restrictions in the governorate. |
| `transport.congestion.detected.v1` | mobility-logistics | normal | Non-appearance correlates with corridor congestion on hearing days. |
| `environment.water-quality.updated.v1` | environment | normal | Environmental degradation records are evidence in environmental proceedings. |
| `research.finding.released.v1` | research | normal | Forensic and legal-informatics results are adopted by the navigator when released. |
| `twin.anomaly.detected.v1` | national-digital-twin | normal | A regional anomaly usually precedes a case surge in the same governorate. |
| `iot.sensor.observation.v1` | digital-nervous-system | normal | Courthouse occupancy sensors feed the court twin, so saturation is measured rather than asserted. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
