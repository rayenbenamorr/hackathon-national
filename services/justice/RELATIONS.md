# RELATIONS — Justice Intelligence OS

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**14 partner ministries** out of 23 (target: 14).
`digital-nervous-system` · `environment` · `global-tunisia` · `health` · `land` · `life-care` · `mobility-logistics` · `national-digital-twin` · `research` · `resilience` · `safety-emergency` · `smart-trade` · `social-mobility` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| safety-emergency | event | `emergency.incident.created.v1` | normal | A serious incident becomes a case file; opening it from the incident removes a manual re-entry step. |
| land | event | `land.zoning.changed.v1` | normal | Zoning changes are the single largest generator of land disputes; the court twin anticipates the load. |
| land | event | `land.parcel.updated.v1` | normal | Parcel records are evidence in property cases and must be current when a case is heard. |
| social-mobility | event | `social.vulnerability.updated.v1` | normal | Legal aid is targeted at the cohorts that cannot otherwise reach a court. |
| treasury | event | `treasury.budget-line.updated.v1` | normal | Court staffing and digitisation move with the justice budget line. |
| smart-trade | event | `trade.supply-risk.flagged.v1` | normal | Commercial disputes rise with supply failures; the workflow pre-positions commercial chambers. |
| resilience | event | `resilience.crisis.declared.v1` | critical | A declared crisis suspends deadlines and moves hearings — the workflow must know immediately. |
| health | event | `health.epidemic-signal.detected.v1` | normal | Hearing continuity plans depend on health restrictions in the governorate. |
| mobility-logistics | event | `transport.congestion.detected.v1` | normal | Non-appearance correlates with corridor congestion on hearing days. |
| environment | event | `environment.water-quality.updated.v1` | normal | Environmental degradation records are evidence in environmental proceedings. |
| research | event | `research.finding.released.v1` | normal | Forensic and legal-informatics results are adopted by the navigator when released. |
| national-digital-twin | event | `twin.anomaly.detected.v1` | normal | A regional anomaly usually precedes a case surge in the same governorate. |
| digital-nervous-system | event | `iot.sensor.observation.v1` | normal | Courthouse occupancy sensors feed the court twin, so saturation is measured rather than asserted. |
| national-digital-twin | api | `GET /regions/stress` | normal | Regional stress explains case surges the court twin cannot see on its own. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| global-tunisia | event | `justice.legal-text.published.v1` | normal | Consular guidance is only correct if it tracks the applicable text. |
| treasury | event | `justice.court-load.updated.v1` | normal | Court saturation is the justification for justice budget reallocation. |
| social-mobility | event | `justice.case.filed.v1` | normal | Case volume in family and labour matters is a social distress indicator. |
| smart-trade | event | `justice.legal-text.published.v1` | normal | Export requirements change when the applicable text changes. |
| life-care | event | `justice.case.filed.v1` | normal | Family and guardianship cases are life events with legal weight. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
