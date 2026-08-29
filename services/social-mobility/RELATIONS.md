# RELATIONS — Social Mobility OS

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**16 partner ministries** out of 23 (target: 14).
`education` · `food-water` · `global-tunisia` · `health` · `industrial-energy` · `infrastructure` · `justice` · `life-care` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `resilience` · `safety-emergency` · `skills-opportunity` · `talent` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| health | event | `health.capacity.updated.v1` | normal | Health access is a component of the vulnerability index. |
| health | event | `health.epidemic-signal.detected.v1` | normal | An epidemic signal changes which cohorts are exposed and how. |
| education | event | `education.learning-progress.updated.v1` | critical | Schooling outcomes are a core axis of social mobility. |
| education | event | `education.school-condition.updated.v1` | normal | A degraded school is a mobility constraint on the cohort around it. |
| food-water | event | `agriculture.water-shortage.predicted.v1` | critical | Water shortage translates directly into household need in rural cohorts. |
| industrial-energy | event | `energy.outage-risk.flagged.v1` | normal | Energy insecurity is one of the fastest drivers of household vulnerability. |
| treasury | event | `treasury.aid.disbursed.v1` | critical | Vulnerability must fall when aid actually lands; that loop must be closed. |
| skills-opportunity | event | `skills.gap.detected.v1` | normal | A gap next to a cohort is an opportunity, not only a shortage. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | normal | Transport access is one of the strongest predictors of employment access. |
| life-care | event | `care.support-need.detected.v1` | critical | Care needs and social needs are the same household seen from two ministries. |
| safety-emergency | event | `emergency.incident.created.v1` | normal | Repeated incidents in a zone are a vulnerability signal. |
| resilience | event | `resilience.crisis.declared.v1` | critical | Crisis response must be ordered by vulnerability, which means seeing the declaration. |
| infrastructure | event | `infrastructure.asset-health.updated.v1` | normal | Water and power network health is lived as household quality. |
| justice | event | `justice.case.filed.v1` | normal | Case volume in family and labour matters is a social distress indicator. |
| health | api | `GET /capacity` | normal | Eligibility for health-linked support checks live regional capacity. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `social.vulnerability.updated.v1` | normal | Legal aid is targeted at the cohorts that cannot otherwise reach a court. |
| resilience | event | `social.vulnerability.updated.v1` | critical | Evacuation and aid priority follow vulnerability, not geography alone. |
| safety-emergency | event | `social.vulnerability.updated.v1` | normal | Vulnerable cohorts need a different response, not the same one faster. |
| global-tunisia | event | `social.benefit.granted.v1` | normal | Portability of social rights is one of the most common consular questions. |
| treasury | event | `social.household-need.detected.v1` | critical | Detected need is what the aid wallet exists to answer. |
| national-digital-twin | event | `social.vulnerability.updated.v1` | critical | Vulnerability is what makes the same shock a different event in two governorates. |
| skills-opportunity | event | `social.vulnerability.updated.v1` | critical | Micro-missions are placed where mobility is blocked, not where it is easy. |
| health | event | `social.vulnerability.updated.v1` | critical | Vulnerable cohorts need outreach, not availability. |
| education | event | `social.vulnerability.updated.v1` | critical | Dropout risk is a social signal before it is an academic one. |
| talent | event | `social.vulnerability.updated.v1` | critical | Youth opportunity is targeted where mobility is blocked. |
| religious-heritage | event | `social.vulnerability.updated.v1` | normal | Zaouias and madrasas remain community services in the most fragile neighbourhoods. |
| life-care | event | `social.vulnerability.updated.v1` | critical | Vulnerability and care need are the same household from two angles. |
| life-care | event | `social.household-need.detected.v1` | critical | A detected household need usually resolves into a care placement. |
| life-care | api | `GET /vulnerability` | critical | Coverage planning reads live vulnerability rather than the last event. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
