# RELATIONS — National Land Intelligence System

> Generated from `tools/spec/relations.mjs`. Do not edit by hand: change the spec
> and run `pnpm generate`.

**18 partner ministries** out of 23 (target: 14).
`culture` · `digital-nervous-system` · `education` · `environment` · `food-water` · `global-tunisia` · `industrial-energy` · `infrastructure` · `justice` · `mobility-logistics` · `national-digital-twin` · `religious-heritage` · `research` · `resilience` · `safety-emergency` · `smart-trade` · `tourism` · `treasury`

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| environment | event | `environment.climate-risk.updated.v1` | critical | Flood and drought risk are hard constraints on any siting score. |
| environment | event | `environment.air-quality.updated.v1` | normal | Air quality is a constraint on residential and school siting. |
| food-water | event | `agriculture.water-demand.predicted.v1` | critical | Water availability decides whether agricultural zoning is viable. |
| food-water | event | `agriculture.water-shortage.predicted.v1` | critical | A shortage forecast should freeze water-intensive siting decisions. |
| infrastructure | event | `infrastructure.asset-health.updated.v1` | critical | A site is only suitable if the networks reaching it are. |
| mobility-logistics | event | `transport.mobility-demand.updated.v1` | critical | Accessibility is one of the strongest terms in a suitability score. |
| industrial-energy | event | `industry.production.updated.v1` | normal | Industrial activity defines the real use of industrial zoning. |
| safety-emergency | event | `emergency.incident.created.v1` | normal | Repeated incidents on a parcel are a siting constraint. |
| resilience | event | `resilience.crisis.declared.v1` | normal | Crisis staging areas are drawn from the public asset register. |
| treasury | event | `treasury.budget-line.updated.v1` | normal | Public asset valuation and the budget move together. |
| tourism | event | `tourism.site-pressure.detected.v1` | normal | Touristic zoning pressure is measured, not assumed. |
| culture | event | `culture.asset-condition.updated.v1` | normal | Protected cultural assets constrain neighbouring parcels. |
| education | event | `education.school-condition.updated.v1` | normal | School siting is a land decision with a 40-year horizon. |
| national-digital-twin | event | `twin.scenario.completed.v1` | normal | Scenario outcomes are usually expressed as land decisions. |
| food-water | api | `GET /irrigation/plan` | normal | Water plans are read directly when an agricultural site is evaluated. |

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
| justice | event | `land.zoning.changed.v1` | normal | Zoning changes are the single largest generator of land disputes; the court twin anticipates the load. |
| justice | event | `land.parcel.updated.v1` | normal | Parcel records are evidence in property cases and must be current when a case is heard. |
| resilience | event | `land.site-suitability.scored.v1` | normal | Shelter and staging sites come from land suitability, scored in advance. |
| global-tunisia | event | `land.site-suitability.scored.v1` | normal | Diaspora investment is overwhelmingly land- and site-driven. |
| treasury | event | `land.site-suitability.scored.v1` | normal | Public asset valuation and investment siting share the same scores. |
| national-digital-twin | event | `land.zoning.changed.v1` | normal | Zoning is the lever most scenarios end up recommending. |
| industrial-energy | event | `land.site-suitability.scored.v1` | normal | Renewable siting is a land question before it is an energy question. |
| smart-trade | event | `land.zoning.changed.v1` | normal | Industrial zoning determines where production can expand. |
| food-water | event | `land.parcel.updated.v1` | normal | Farm boundaries and areas come from the land register. |
| food-water | event | `land.zoning.changed.v1` | normal | Agricultural land converted to another use leaves the water demand model. |
| research | event | `land.site-suitability.scored.v1` | normal | Living lab sites are chosen by land suitability. |
| religious-heritage | event | `land.zoning.changed.v1` | normal | What may be built next to a protected site is decided by zoning around it. |
| digital-nervous-system | event | `land.parcel.updated.v1` | normal | Sensor and node siting is a land question. |
| infrastructure | event | `land.zoning.changed.v1` | normal | New zoning creates infrastructure obligations before it creates buildings. |
| environment | event | `land.zoning.changed.v1` | normal | Land-use change is the slowest and largest environmental driver. |

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root `CLAUDE.md`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version `.v2`, with `.v1` kept alive;
3. `pnpm architecture:check` is what tells you which of the two you just did.
