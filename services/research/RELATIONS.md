# RELATIONS — Tunisia Research Brain

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**17 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `environment` · `food-water` · `global-tunisia` · `health` · `industrial-energy` · `infrastructure` · `justice` · `land` · `national-digital-twin` · `religious-heritage` · `skills-opportunity` · `smart-trade` · `talent` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| skills-opportunity | event | `skills.gap.detected.v1` | normal | A persistent national gap is a research and training agenda. |
| food-water | event | `agriculture.water-shortage.predicted.v1` | critical | Water scarcity is the most funded applied research question in the country. |
| environment | event | `environment.climate-risk.updated.v1` | critical | Climate projections set the agenda of the living labs. |
| health | event | `health.epidemic-signal.detected.v1` | critical | An epidemic signal is a research trigger with a deadline. |
| industrial-energy | event | `industry.symbiosis.matched.v1` | normal | Symbiosis matches are process research made concrete. |
| infrastructure | event | `infrastructure.failure.predicted.v1` | normal | Materials and structural research follows real failure modes. |
| education | event | `education.program.updated.v1` | normal | Programmes and research capability must stay in the same graph. |
| treasury | event | `treasury.funding.approved.v1` | critical | A research project without approved funding is a proposal. |
| national-digital-twin | event | `twin.scenario.completed.v1` | normal | Scenario gaps are exactly where research is missing. |
| land | event | `land.site-suitability.scored.v1` | normal | Living lab sites are chosen by land suitability. |
| smart-trade | event | `trade.supply-risk.flagged.v1` | normal | A supply dependency at risk is a substitution research problem. |
| global-tunisia | event | `global.diaspora-signal.updated.v1` | normal | Diaspora researchers are a large part of national research capability. |
| culture | event | `culture.asset-condition.updated.v1` | normal | Conservation science is driven by measured asset degradation. |
| talent | event | `talent.injury-risk.flagged.v1` | normal | Sports science is applied physiology research with a live dataset. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `research.finding.released.v1` | normal | Forensic and legal-informatics results are adopted by the navigator when released. |
| global-tunisia | event | `research.project.published.v1` | normal | Research projects abroad and at home are matched through the diaspora graph. |
| treasury | event | `research.transfer.matched.v1` | normal | A matched transfer is a funding decision waiting to be made. |
| industrial-energy | event | `research.finding.released.v1` | normal | Process and materials results are adopted first by industry. |
| smart-trade | event | `research.finding.released.v1` | normal | Certification and process results unlock markets that were closed. |
| food-water | event | `research.finding.released.v1` | normal | Agronomy and water results are adopted directly by the farm twin. |
| skills-opportunity | event | `research.project.published.v1` | normal | Research activity is an advanced-skill demand signal. |
| skills-opportunity | event | `research.transfer.matched.v1` | normal | A technology transfer creates a specific, datable skill need. |
| skills-opportunity | api | `GET /capability` | normal | Research capability is read when a career path targets an advanced domain. |
| education | event | `research.finding.released.v1` | normal | Pedagogy and curriculum results enter the knowledge graph. |
| religious-heritage | event | `research.finding.released.v1` | normal | Conservation science results are adopted directly by the sensor network. |
| digital-nervous-system | event | `research.finding.released.v1` | normal | Edge inference and networking results are deployed on the fabric. |
| environment | event | `research.finding.released.v1` | normal | Measurement and modelling results are adopted by the climate twin. |
| culture | event | `research.finding.released.v1` | normal | Conservation science results change how assets are treated. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
