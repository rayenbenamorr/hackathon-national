# EVENTS — Tunisia Research Brain

Contracts live in `packages/contracts/src/events/research.ts`. The bus
refuses to deliver anything that does not match them.

## Published by this service

### `research.project.published.v1`

A research project was registered or updated.

| Field | Type |
| --- | --- |
| `projectId` | `string` |
| `title` | `string` |
| `discipline` | `string` |
| `governorate` | `gov` |
| `trl` | `int` |
| `publishedAt` | `date` |

Consumed by: `global-tunisia`, `skills-opportunity`

### `research.finding.released.v1`

A usable result was released.

| Field | Type |
| --- | --- |
| `findingId` | `string` |
| `projectId` | `string` |
| `discipline` | `string` |
| `summary` | `text` |
| `applicableTo` | `string[]` |
| `releasedAt` | `date` |

Consumed by: `justice`, `industrial-energy`, `smart-trade`, `food-water`, `education`, `religious-heritage`, `digital-nervous-system`, `environment`, `culture`

### `research.transfer.matched.v1`

A result was matched to a ministry need.

| Field | Type |
| --- | --- |
| `transferId` | `string` |
| `findingId` | `string` |
| `targetService` | `string` |
| `need` | `text` |
| `readiness` | `unit` |
| `matchedAt` | `date` |

Consumed by: `treasury`, `skills-opportunity`


## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
| `skills.gap.detected.v1` | skills-opportunity | normal | A persistent national gap is a research and training agenda. |
| `agriculture.water-shortage.predicted.v1` | food-water | critical | Water scarcity is the most funded applied research question in the country. |
| `environment.climate-risk.updated.v1` | environment | critical | Climate projections set the agenda of the living labs. |
| `health.epidemic-signal.detected.v1` | health | critical | An epidemic signal is a research trigger with a deadline. |
| `industry.symbiosis.matched.v1` | industrial-energy | normal | Symbiosis matches are process research made concrete. |
| `infrastructure.failure.predicted.v1` | infrastructure | normal | Materials and structural research follows real failure modes. |
| `education.program.updated.v1` | education | normal | Programmes and research capability must stay in the same graph. |
| `treasury.funding.approved.v1` | treasury | critical | A research project without approved funding is a proposal. |
| `twin.scenario.completed.v1` | national-digital-twin | normal | Scenario gaps are exactly where research is missing. |
| `land.site-suitability.scored.v1` | land | normal | Living lab sites are chosen by land suitability. |
| `trade.supply-risk.flagged.v1` | smart-trade | normal | A supply dependency at risk is a substitution research problem. |
| `global.diaspora-signal.updated.v1` | global-tunisia | normal | Diaspora researchers are a large part of national research capability. |
| `culture.asset-condition.updated.v1` | culture | normal | Conservation science is driven by measured asset degradation. |
| `talent.injury-risk.flagged.v1` | talent | normal | Sports science is applied physiology research with a live dataset. |

Handlers: `src/consumers.ts`. Every one already stores the signal; add your
reaction underneath.
