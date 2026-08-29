# EVENTS — Social Mobility OS

Contracts live in `packages/contracts/src/events/social-mobility.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `social.vulnerability.updated.v1`

A cohort vulnerability index moved.

| Field | Type |
| --- | --- |
| `cohortId` | `string` |
| `governorate` | `gov` |
| `vulnerabilityIndex` | `unit` |
| `drivers` | `string[]` |
| `size` | `int` |
| `updatedAt` | `date` |

Consumed by: `justice`, `resilience`, `safety-emergency`, `national-digital-twin`, `skills-opportunity`, `health`, `education`, `talent`, `religious-heritage`, `life-care`

### `social.benefit.granted.v1`

A benefit was granted to a cohort.

| Field | Type |
| --- | --- |
| `benefitId` | `string` |
| `cohortId` | `string` |
| `benefitType` | `string` |
| `governorate` | `gov` |
| `beneficiaries` | `int` |
| `grantedAt` | `date` |

Consumed by: `global-tunisia`

### `social.household-need.detected.v1`

A need was detected from cross-ministry signals before anyone asked.

| Field | Type |
| --- | --- |
| `needId` | `string` |
| `cohortId` | `string` |
| `needType` | `enum:water|energy|food|health|housing|schooling|income` |
| `governorate` | `gov` |
| `urgency` | `enum:normal|high|critical` |
| `detectedAt` | `date` |

Consumed by: `treasury`, `life-care`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `health.capacity.updated.v1` | health | normal | Health access is a component of the vulnerability index. |
| `health.epidemic-signal.detected.v1` | health | normal | An epidemic signal changes which cohorts are exposed and how. |
| `education.learning-progress.updated.v1` | education | critical | Schooling outcomes are a core axis of social mobility. |
| `education.school-condition.updated.v1` | education | normal | A degraded school is a mobility constraint on the cohort around it. |
| `agriculture.water-shortage.predicted.v1` | food-water | critical | Water shortage translates directly into household need in rural cohorts. |
| `energy.outage-risk.flagged.v1` | industrial-energy | normal | Energy insecurity is one of the fastest drivers of household vulnerability. |
| `treasury.aid.disbursed.v1` | treasury | critical | Vulnerability must fall when aid actually lands; that loop must be closed. |
| `skills.gap.detected.v1` | skills-opportunity | normal | A gap next to a cohort is an opportunity, not only a shortage. |
| `transport.mobility-demand.updated.v1` | mobility-logistics | normal | Transport access is one of the strongest predictors of employment access. |
| `care.support-need.detected.v1` | life-care | critical | Care needs and social needs are the same household seen from two ministries. |
| `emergency.incident.created.v1` | safety-emergency | normal | Repeated incidents in a zone are a vulnerability signal. |
| `resilience.crisis.declared.v1` | resilience | critical | Crisis response must be ordered by vulnerability, which means seeing the declaration. |
| `infrastructure.asset-health.updated.v1` | infrastructure | normal | Water and power network health is lived as household quality. |
| `justice.case.filed.v1` | justice | normal | Case volume in family and labour matters is a social distress indicator. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
