# EVENTS — Global Tunisia Network

Contracts live in `packages/contracts/src/events/global-tunisia.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `global.consular-request.created.v1`

A consular request was filed abroad.

| Field | Type |
| --- | --- |
| `requestId` | `string` |
| `post` | `string` |
| `country` | `string` |
| `requestType` | `enum:passport|civil-status|visa|assistance|investment` |
| `filedAt` | `date` |

Consumed by: _nobody yet_

### `global.opportunity.published.v1`

An opportunity at home is opened to the diaspora.

| Field | Type |
| --- | --- |
| `opportunityId` | `string` |
| `title` | `string` |
| `sector` | `string` |
| `governorate` | `gov` |
| `requiredSkills` | `string[]` |
| `publishedAt` | `date` |

Consumed by: `culture`

### `global.diaspora-signal.updated.v1`

Aggregate diaspora signal: skills concentration and investment appetite per country.

| Field | Type |
| --- | --- |
| `country` | `string` |
| `cohortSize` | `int` |
| `topSkills` | `string[]` |
| `investmentAppetite` | `unit` |
| `observedAt` | `date` |

Consumed by: `smart-trade`, `skills-opportunity`, `research`, `tourism`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `skills.gap.detected.v1` | skills-opportunity | critical | A national skill gap is exactly what the diaspora is asked to fill. |
| `skills.micro-mission.published.v1` | skills-opportunity | normal | Remote missions are the lowest-friction way to mobilise expertise abroad. |
| `research.project.published.v1` | research | normal | Research projects abroad and at home are matched through the diaspora graph. |
| `trade.export-opportunity.detected.v1` | smart-trade | critical | Export openings are relayed to diaspora networks in the target market. |
| `treasury.funding.approved.v1` | treasury | normal | Funded programmes are the opportunities worth publishing abroad. |
| `culture.event.scheduled.v1` | culture | normal | Cultural programming is the main reason diaspora travel is planned. |
| `tourism.experience.published.v1` | tourism | normal | Diaspora visits are a distinct, high-value tourism segment. |
| `justice.legal-text.published.v1` | justice | normal | Consular guidance is only correct if it tracks the applicable text. |
| `health.epidemic-signal.detected.v1` | health | normal | Travel advice to citizens abroad depends on the health situation at home. |
| `resilience.crisis.declared.v1` | resilience | critical | A crisis at home triggers consular contact procedures for affected families. |
| `education.program.updated.v1` | education | normal | Recognition and equivalence questions follow programme changes. |
| `twin.state.updated.v1` | national-digital-twin | normal | Regional state is what the diaspora asks about before investing. |
| `land.site-suitability.scored.v1` | land | normal | Diaspora investment is overwhelmingly land- and site-driven. |
| `care.life-event.recorded.v1` | life-care | normal | Civil-status life events abroad and at home must reconcile. |
| `social.benefit.granted.v1` | social-mobility | normal | Portability of social rights is one of the most common consular questions. |
| `industry.production.updated.v1` | industrial-energy | normal | Diaspora investment targets specific industrial sectors, not the country in the abstract. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
