# RELATIONS — Global Tunisia Network

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**15 partner ministries** out of 23 (target: 14).
`culture` · `education` · `health` · `industrial-energy` · `justice` · `land` · `life-care` · `national-digital-twin` · `research` · `resilience` · `skills-opportunity` · `smart-trade` · `social-mobility` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| skills-opportunity | event | `skills.gap.detected.v1` | critical | A national skill gap is exactly what the diaspora is asked to fill. |
| skills-opportunity | event | `skills.micro-mission.published.v1` | normal | Remote missions are the lowest-friction way to mobilise expertise abroad. |
| research | event | `research.project.published.v1` | normal | Research projects abroad and at home are matched through the diaspora graph. |
| smart-trade | event | `trade.export-opportunity.detected.v1` | critical | Export openings are relayed to diaspora networks in the target market. |
| treasury | event | `treasury.funding.approved.v1` | normal | Funded programmes are the opportunities worth publishing abroad. |
| culture | event | `culture.event.scheduled.v1` | normal | Cultural programming is the main reason diaspora travel is planned. |
| tourism | event | `tourism.experience.published.v1` | normal | Diaspora visits are a distinct, high-value tourism segment. |
| justice | event | `justice.legal-text.published.v1` | normal | Consular guidance is only correct if it tracks the applicable text. |
| health | event | `health.epidemic-signal.detected.v1` | normal | Travel advice to citizens abroad depends on the health situation at home. |
| resilience | event | `resilience.crisis.declared.v1` | critical | A crisis at home triggers consular contact procedures for affected families. |
| education | event | `education.program.updated.v1` | normal | Recognition and equivalence questions follow programme changes. |
| national-digital-twin | event | `twin.state.updated.v1` | normal | Regional state is what the diaspora asks about before investing. |
| land | event | `land.site-suitability.scored.v1` | normal | Diaspora investment is overwhelmingly land- and site-driven. |
| life-care | event | `care.life-event.recorded.v1` | normal | Civil-status life events abroad and at home must reconcile. |
| social-mobility | event | `social.benefit.granted.v1` | normal | Portability of social rights is one of the most common consular questions. |
| industrial-energy | event | `industry.production.updated.v1` | normal | Diaspora investment targets specific industrial sectors, not the country in the abstract. |
| skills-opportunity | api | `GET /gaps` | normal | The opportunity engine ranks diaspora outreach against live regional gaps. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| smart-trade | event | `global.diaspora-signal.updated.v1` | normal | Diaspora demand is a real and under-used export channel. |
| skills-opportunity | event | `global.diaspora-signal.updated.v1` | normal | Skills concentrated abroad are supply the national graph should count. |
| research | event | `global.diaspora-signal.updated.v1` | normal | Diaspora researchers are a large part of national research capability. |
| tourism | event | `global.diaspora-signal.updated.v1` | normal | Diaspora travel is a distinct, forecastable segment. |
| culture | event | `global.opportunity.published.v1` | normal | Diaspora audiences and funding are part of the creative economy. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
