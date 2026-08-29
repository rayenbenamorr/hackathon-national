/**
 * THE RELATIONSHIP REGISTRY (§9) — the most important file in the repository.
 *
 * The hackathon is not 24 applications. It is one ecosystem, and this file is
 * where that claim is either true or empty. Every entry below is a real domain
 * dependency with a stated purpose; `pnpm architecture:check` refuses relations
 * that point at events nobody publishes, and refuses a service that does not
 * reach the connectivity target (≈60% of the other 23, i.e. 14 partners).
 *
 * DIRECTION: the key is the CONSUMER. `justice: [ev('safety-emergency', …)]`
 * reads "Justice consumes an event produced by Safety & Emergency".
 *
 * Nothing here is decoration: the generator turns each line into a working
 * consumer handler or API adapter inside the consuming service, plus a row in
 * RELATIONS.md, plus an edge in the portal graph, plus a relation test.
 *
 * Criticality:
 *   critical — the consumer cannot do its core job without it (tested end to end)
 *   normal   — materially better with it, degrades cleanly without it
 */

const ev = (source, event, criticality, reason) => ({
  kind: 'event',
  source,
  ref: event,
  criticality,
  reason,
});
const api = (source, route, criticality, reason) => ({
  kind: 'api',
  source,
  ref: route,
  criticality,
  reason,
});

export const RELATIONS = {
  // ---------------------------------------------------------------- justice
  justice: [
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'normal',
      'A serious incident becomes a case file; opening it from the incident removes a manual re-entry step.',
    ),
    ev(
      'land',
      'land.zoning.changed.v1',
      'normal',
      'Zoning changes are the single largest generator of land disputes; the court twin anticipates the load.',
    ),
    ev(
      'land',
      'land.parcel.updated.v1',
      'normal',
      'Parcel records are evidence in property cases and must be current when a case is heard.',
    ),
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'normal',
      'Legal aid is targeted at the cohorts that cannot otherwise reach a court.',
    ),
    ev(
      'treasury',
      'treasury.budget-line.updated.v1',
      'normal',
      'Court staffing and digitisation move with the justice budget line.',
    ),
    ev(
      'smart-trade',
      'trade.supply-risk.flagged.v1',
      'normal',
      'Commercial disputes rise with supply failures; the workflow pre-positions commercial chambers.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'A declared crisis suspends deadlines and moves hearings — the workflow must know immediately.',
    ),
    ev(
      'health',
      'health.epidemic-signal.detected.v1',
      'normal',
      'Hearing continuity plans depend on health restrictions in the governorate.',
    ),
    ev(
      'mobility-logistics',
      'transport.congestion.detected.v1',
      'normal',
      'Non-appearance correlates with corridor congestion on hearing days.',
    ),
    ev(
      'environment',
      'environment.water-quality.updated.v1',
      'normal',
      'Environmental degradation records are evidence in environmental proceedings.',
    ),
    ev(
      'research',
      'research.finding.released.v1',
      'normal',
      'Forensic and legal-informatics results are adopted by the navigator when released.',
    ),
    ev(
      'national-digital-twin',
      'twin.anomaly.detected.v1',
      'normal',
      'A regional anomaly usually precedes a case surge in the same governorate.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'normal',
      'Courthouse occupancy sensors feed the court twin, so saturation is measured rather than asserted.',
    ),
    api(
      'national-digital-twin',
      'GET /regions/stress',
      'normal',
      'Regional stress explains case surges the court twin cannot see on its own.',
    ),
  ],

  // ------------------------------------------------------------- resilience
  resilience: [
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'critical',
      'Clustered incidents are how a crisis is first detected, before anyone declares one.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'critical',
      'Drought, heat and flood risk are the leading indicators the command system watches.',
    ),
    ev(
      'food-water',
      'agriculture.water-shortage.predicted.v1',
      'critical',
      'A predicted water shortage is a slow-onset crisis; declaring early is the whole point.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'critical',
      'A relief plan that ignores hospital saturation sends people where they cannot be treated.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'critical',
      'A predicted bridge or network failure changes every evacuation route.',
    ),
    ev(
      'industrial-energy',
      'energy.outage-risk.flagged.v1',
      'normal',
      'Power shortfall determines which shelters and hospitals need generators.',
    ),
    ev(
      'mobility-logistics',
      'transport.resource.dispatched.v1',
      'critical',
      'The relief plan tracks coverage only if it sees what was actually dispatched.',
    ),
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'critical',
      'Evacuation and aid priority follow vulnerability, not geography alone.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Water level, rainfall and wind observations drive early crisis detection.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'normal',
      'A relief plan is only real once its funding is approved.',
    ),
    ev(
      'land',
      'land.site-suitability.scored.v1',
      'normal',
      'Shelter and staging sites come from land suitability, scored in advance.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'Schools are the default shelter network; their condition decides which can be used.',
    ),
    ev(
      'tourism',
      'tourism.site-pressure.detected.v1',
      'normal',
      'Visitor concentration changes the population actually present in a zone.',
    ),
    ev(
      'national-digital-twin',
      'twin.anomaly.detected.v1',
      'normal',
      'Multi-sector anomalies are early crisis signatures.',
    ),
    api(
      'mobility-logistics',
      'POST /dispatch',
      'critical',
      'Relief logistics has no vehicles of its own; every convoy is dispatched through Transport.',
    ),
    api(
      'health',
      'GET /capacity',
      'critical',
      'Casualty routing needs live bed and ICU availability at plan time, not at event time.',
    ),
  ],

  // ------------------------------------------------------- safety-emergency
  'safety-emergency': [
    ev(
      'health',
      'health.capacity.updated.v1',
      'critical',
      'Dispatch sends casualties to the nearest facility that can actually receive them.',
    ),
    ev(
      'health',
      'health.emergency.declared.v1',
      'critical',
      'A health emergency needs civil protection resources Health does not own.',
    ),
    ev(
      'mobility-logistics',
      'transport.congestion.detected.v1',
      'critical',
      'Congestion changes response time more than distance does.',
    ),
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'normal',
      'Air quality drives both road risk and the protection level responders need.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Traffic, rainfall and vibration observations feed continuous road-risk scoring.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'critical',
      'A failing bridge is a road-risk input and a route exclusion at the same time.',
    ),
    ev(
      'food-water',
      'water.reservoir-level.updated.v1',
      'normal',
      'Reservoir state is a flood precursor for downstream zones.',
    ),
    ev(
      'industrial-energy',
      'industry.production.updated.v1',
      'normal',
      'Industrial activity localises the risk of industrial incidents.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Under a declared crisis the grid switches to crisis dispatch rules.',
    ),
    ev(
      'culture',
      'culture.event.scheduled.v1',
      'normal',
      'A scheduled gathering changes both crowd risk and the resources to pre-position.',
    ),
    ev(
      'tourism',
      'tourism.visitor-flow.updated.v1',
      'normal',
      'Visitor volume changes how many people are in a zone at a given hour.',
    ),
    ev(
      'talent',
      'talent.facility-usage.updated.v1',
      'normal',
      'Stadium and gymnasium usage is crowd exposure.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'School condition and occupancy shape the response to a building incident.',
    ),
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'normal',
      'Vulnerable cohorts need a different response, not the same one faster.',
    ),
    api(
      'mobility-logistics',
      'POST /dispatch',
      'critical',
      'Every ambulance, truck and boat belongs to Transport; dispatch is a call, not a database write.',
    ),
    api(
      'health',
      'GET /capacity',
      'critical',
      'Triage decides a destination facility, which requires live capacity.',
    ),
  ],

  // ---------------------------------------------------------- global-tunisia
  'global-tunisia': [
    ev(
      'skills-opportunity',
      'skills.gap.detected.v1',
      'critical',
      'A national skill gap is exactly what the diaspora is asked to fill.',
    ),
    ev(
      'skills-opportunity',
      'skills.micro-mission.published.v1',
      'normal',
      'Remote missions are the lowest-friction way to mobilise expertise abroad.',
    ),
    ev(
      'research',
      'research.project.published.v1',
      'normal',
      'Research projects abroad and at home are matched through the diaspora graph.',
    ),
    ev(
      'smart-trade',
      'trade.export-opportunity.detected.v1',
      'critical',
      'Export openings are relayed to diaspora networks in the target market.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'normal',
      'Funded programmes are the opportunities worth publishing abroad.',
    ),
    ev(
      'culture',
      'culture.event.scheduled.v1',
      'normal',
      'Cultural programming is the main reason diaspora travel is planned.',
    ),
    ev(
      'tourism',
      'tourism.experience.published.v1',
      'normal',
      'Diaspora visits are a distinct, high-value tourism segment.',
    ),
    ev(
      'justice',
      'justice.legal-text.published.v1',
      'normal',
      'Consular guidance is only correct if it tracks the applicable text.',
    ),
    ev(
      'health',
      'health.epidemic-signal.detected.v1',
      'normal',
      'Travel advice to citizens abroad depends on the health situation at home.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'A crisis at home triggers consular contact procedures for affected families.',
    ),
    ev(
      'education',
      'education.program.updated.v1',
      'normal',
      'Recognition and equivalence questions follow programme changes.',
    ),
    ev(
      'national-digital-twin',
      'twin.state.updated.v1',
      'normal',
      'Regional state is what the diaspora asks about before investing.',
    ),
    ev(
      'land',
      'land.site-suitability.scored.v1',
      'normal',
      'Diaspora investment is overwhelmingly land- and site-driven.',
    ),
    ev(
      'life-care',
      'care.life-event.recorded.v1',
      'normal',
      'Civil-status life events abroad and at home must reconcile.',
    ),
    ev(
      'social-mobility',
      'social.benefit.granted.v1',
      'normal',
      'Portability of social rights is one of the most common consular questions.',
    ),
    ev(
      'industrial-energy',
      'industry.production.updated.v1',
      'normal',
      'Diaspora investment targets specific industrial sectors, not the country in the abstract.',
    ),
    api(
      'skills-opportunity',
      'GET /gaps',
      'normal',
      'The opportunity engine ranks diaspora outreach against live regional gaps.',
    ),
  ],

  // ----------------------------------------------------------------treasury
  treasury: [
    ev(
      'resilience',
      'resilience.relief-plan.updated.v1',
      'critical',
      'A relief plan is a spending commitment; the treasury twin must see it as it forms.',
    ),
    ev(
      'resilience',
      'resilience.resource-request.created.v1',
      'critical',
      'Resource requests are funding requests wearing another name.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'normal',
      'Saturation is the earliest signal of an unbudgeted health cost.',
    ),
    ev(
      'food-water',
      'agriculture.water-shortage.predicted.v1',
      'critical',
      'Water shortage has a known fiscal shape: compensation, tankering, import.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'critical',
      'Predicted failure lets maintenance be budgeted instead of emergency-funded.',
    ),
    ev(
      'infrastructure',
      'infrastructure.maintenance.scheduled.v1',
      'normal',
      'Scheduled work orders are the committed half of the infrastructure budget.',
    ),
    ev(
      'social-mobility',
      'social.household-need.detected.v1',
      'critical',
      'Detected need is what the aid wallet exists to answer.',
    ),
    ev(
      'industrial-energy',
      'energy.outage-risk.flagged.v1',
      'normal',
      'Outage risk carries a subsidy and compensation exposure.',
    ),
    ev(
      'smart-trade',
      'trade.supply-risk.flagged.v1',
      'normal',
      'Supply risk moves customs revenue and import cost together.',
    ),
    ev(
      'education',
      'education.program.updated.v1',
      'normal',
      'A new programme is a recurring cost that must enter the fiscal year.',
    ),
    ev(
      'justice',
      'justice.court-load.updated.v1',
      'normal',
      'Court saturation is the justification for justice budget reallocation.',
    ),
    ev(
      'national-digital-twin',
      'twin.scenario.completed.v1',
      'critical',
      'Scenario outcomes are costed before they are decided.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.resolved.v1',
      'normal',
      'Resolved incidents give the actual cost of response, not the estimate.',
    ),
    ev(
      'land',
      'land.site-suitability.scored.v1',
      'normal',
      'Public asset valuation and investment siting share the same scores.',
    ),
    ev(
      'research',
      'research.transfer.matched.v1',
      'normal',
      'A matched transfer is a funding decision waiting to be made.',
    ),
    api(
      'national-digital-twin',
      'GET /regions/stress',
      'normal',
      'Regional stress is the allocation key the optimiser argues from.',
    ),
  ],

  // --------------------------------------------------- national-digital-twin
  'national-digital-twin': [
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'critical',
      'Air quality is one of the six axes of the regional state vector.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'critical',
      'Climate risk is the slow variable every scenario is run against.',
    ),
    ev(
      'food-water',
      'agriculture.water-demand.predicted.v1',
      'critical',
      'Water demand versus supply is the axis that moves every other one.',
    ),
    ev(
      'food-water',
      'agriculture.water-shortage.predicted.v1',
      'critical',
      'A shortage prediction propagates into health, economy and mobility in the model.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'critical',
      'Health load is a direct component of the regional stress index.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'critical',
      'Mobility pressure is a component of the regional stress index.',
    ),
    ev(
      'industrial-energy',
      'energy.grid-load.updated.v1',
      'critical',
      'Energy load is a component of regional economic activity.',
    ),
    ev(
      'infrastructure',
      'infrastructure.asset-health.updated.v1',
      'critical',
      'Asset health bounds what any scenario can assume about capacity.',
    ),
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'critical',
      'Vulnerability is what makes the same shock a different event in two governorates.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'normal',
      'Incident density is a fast indicator against a slow model.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'A declared crisis switches the twin into crisis mode for that zone.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'School condition is a durable component of regional capability.',
    ),
    ev('land', 'land.zoning.changed.v1', 'normal', 'Zoning is the lever most scenarios end up recommending.'),
    ev(
      'tourism',
      'tourism.visitor-flow.updated.v1',
      'normal',
      'Seasonal population is not resident population; the model needs both.',
    ),
    ev(
      'treasury',
      'treasury.fiscal-risk.flagged.v1',
      'normal',
      'A fiscal constraint bounds which scenario outcomes are reachable.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Raw observations keep regional twins current between ministry publications.',
    ),
    ev(
      'smart-trade',
      'trade.shipment.updated.v1',
      'normal',
      'Trade flows are the economic exchange term between regions.',
    ),
    ev(
      'skills-opportunity',
      'skills.gap.detected.v1',
      'normal',
      'Skill availability limits what a regional plan can actually execute.',
    ),
    ev(
      'culture',
      'culture.creative-economy.updated.v1',
      'normal',
      'Creative activity is a measurable part of regional economic activity.',
    ),
    ev(
      'life-care',
      'care.facility-capacity.updated.v1',
      'normal',
      'Care coverage is part of the social axis of the region state.',
    ),
    api(
      'health',
      'GET /capacity',
      'normal',
      'Direct read when the twin needs current capacity rather than the last event.',
    ),
    api(
      'environment',
      'GET /air-quality',
      'normal',
      'Direct read for on-demand recomputation of a region state.',
    ),
    api(
      'mobility-logistics',
      'GET /flows',
      'normal',
      'Direct read of mobility pressure when a scenario is run interactively.',
    ),
  ],

  // -------------------------------------------------------- social-mobility
  'social-mobility': [
    ev(
      'health',
      'health.capacity.updated.v1',
      'normal',
      'Health access is a component of the vulnerability index.',
    ),
    ev(
      'health',
      'health.epidemic-signal.detected.v1',
      'normal',
      'An epidemic signal changes which cohorts are exposed and how.',
    ),
    ev(
      'education',
      'education.learning-progress.updated.v1',
      'critical',
      'Schooling outcomes are a core axis of social mobility.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'A degraded school is a mobility constraint on the cohort around it.',
    ),
    ev(
      'food-water',
      'agriculture.water-shortage.predicted.v1',
      'critical',
      'Water shortage translates directly into household need in rural cohorts.',
    ),
    ev(
      'industrial-energy',
      'energy.outage-risk.flagged.v1',
      'normal',
      'Energy insecurity is one of the fastest drivers of household vulnerability.',
    ),
    ev(
      'treasury',
      'treasury.aid.disbursed.v1',
      'critical',
      'Vulnerability must fall when aid actually lands; that loop must be closed.',
    ),
    ev(
      'skills-opportunity',
      'skills.gap.detected.v1',
      'normal',
      'A gap next to a cohort is an opportunity, not only a shortage.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'normal',
      'Transport access is one of the strongest predictors of employment access.',
    ),
    ev(
      'life-care',
      'care.support-need.detected.v1',
      'critical',
      'Care needs and social needs are the same household seen from two ministries.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'normal',
      'Repeated incidents in a zone are a vulnerability signal.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Crisis response must be ordered by vulnerability, which means seeing the declaration.',
    ),
    ev(
      'infrastructure',
      'infrastructure.asset-health.updated.v1',
      'normal',
      'Water and power network health is lived as household quality.',
    ),
    ev(
      'justice',
      'justice.case.filed.v1',
      'normal',
      'Case volume in family and labour matters is a social distress indicator.',
    ),
    api(
      'health',
      'GET /capacity',
      'normal',
      'Eligibility for health-linked support checks live regional capacity.',
    ),
  ],

  // ------------------------------------------------------ industrial-energy
  'industrial-energy': [
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'critical',
      'Emissions constrain production; the plant twin must see its own consequence.',
    ),
    ev(
      'environment',
      'environment.waste-stream.updated.v1',
      'critical',
      'Waste streams are the raw material of the symbiosis engine.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'normal',
      'Heat risk changes both demand and generation capacity.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Energy load and vibration observations are the grid and asset twins.',
    ),
    ev(
      'food-water',
      'agriculture.water-demand.predicted.v1',
      'critical',
      'Industry and agriculture compete for the same water and the same pumping energy.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'critical',
      'A predicted power-line failure is an outage risk before it is a maintenance order.',
    ),
    ev(
      'mobility-logistics',
      'logistics.freight.updated.v1',
      'normal',
      'Freight movement is the physical trace of industrial output.',
    ),
    ev(
      'smart-trade',
      'trade.supply-risk.flagged.v1',
      'critical',
      'An input dependency at risk stops a production line.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'normal',
      'Industrial and renewable programmes move with approved funding.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Crisis load-shedding priorities are set from the declaration.',
    ),
    ev(
      'research',
      'research.finding.released.v1',
      'normal',
      'Process and materials results are adopted first by industry.',
    ),
    ev(
      'skills-opportunity',
      'skills.gap.detected.v1',
      'normal',
      'Operator and maintenance shortages cap what the grid can safely run.',
    ),
    ev(
      'land',
      'land.site-suitability.scored.v1',
      'normal',
      'Renewable siting is a land question before it is an energy question.',
    ),
    ev(
      'national-digital-twin',
      'twin.scenario.completed.v1',
      'normal',
      'Scenario outcomes set the demand assumptions the grid plans against.',
    ),
    // Deliberately NO synchronous call back to Environment: Environment already
    // calls this service for the generation mix, and two ministries calling each
    // other synchronously is a deadlock waiting for demo day (validator rule 11).
    // The air-quality event above carries everything this direction needs.
  ],

  // ------------------------------------------------------------ smart-trade
  'smart-trade': [
    ev(
      'food-water',
      'agriculture.yield.forecast.v1',
      'critical',
      'Exportable volume of olive oil, dates and cereals is a yield forecast first.',
    ),
    ev(
      'food-water',
      'fisheries.stock.updated.v1',
      'normal',
      'Seafood export capacity follows stock and effort.',
    ),
    ev(
      'industrial-energy',
      'industry.production.updated.v1',
      'critical',
      'The supply graph is built from what plants actually produce.',
    ),
    ev(
      'mobility-logistics',
      'logistics.freight.updated.v1',
      'critical',
      'A shipment without a freight movement is a plan, not a shipment.',
    ),
    ev(
      'mobility-logistics',
      'transport.congestion.detected.v1',
      'normal',
      'Corridor congestion is the most common cause of a missed export window.',
    ),
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'normal',
      'Carbon and emission context feeds the product passport footprint.',
    ),
    ev(
      'infrastructure',
      'infrastructure.asset-health.updated.v1',
      'critical',
      'Port and rail health is a hard constraint on export capacity.',
    ),
    ev(
      'treasury',
      'treasury.fiscal-risk.flagged.v1',
      'normal',
      'Customs revenue exposure and trade risk are read together.',
    ),
    ev(
      'global-tunisia',
      'global.diaspora-signal.updated.v1',
      'normal',
      'Diaspora demand is a real and under-used export channel.',
    ),
    ev(
      'justice',
      'justice.legal-text.published.v1',
      'normal',
      'Export requirements change when the applicable text changes.',
    ),
    ev(
      'research',
      'research.finding.released.v1',
      'normal',
      'Certification and process results unlock markets that were closed.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'normal',
      'A crisis reroutes or blocks corridors and shipments.',
    ),
    ev(
      'land',
      'land.zoning.changed.v1',
      'normal',
      'Industrial zoning determines where production can expand.',
    ),
    ev(
      'skills-opportunity',
      'skills.gap.detected.v1',
      'normal',
      'Certification and quality-control skills gate export readiness.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Cold-chain temperature and container GPS observations are the shipment twin.',
    ),
    ev(
      'health',
      'health.epidemic-signal.detected.v1',
      'normal',
      'Food and pharmaceutical export controls follow health signals at the border.',
    ),
    api(
      'mobility-logistics',
      'GET /flows',
      'normal',
      'Corridor state at the moment an export plan is produced.',
    ),
  ],

  // ------------------------------------------------------------- food-water
  'food-water': [
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'critical',
      'Drought index is the dominant term in every water demand forecast.',
    ),
    ev(
      'environment',
      'environment.water-quality.updated.v1',
      'critical',
      'Unusable water is not supply; quality belongs in the balance.',
    ),
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'normal',
      'Heat and particulate load affect evapotranspiration and crop stress.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Soil moisture, rainfall and reservoir level are the farm and water twins.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'critical',
      'A failing water network turns available water into unavailable water.',
    ),
    ev(
      'industrial-energy',
      'energy.outage-risk.flagged.v1',
      'critical',
      'Irrigation is pumping; no power is no irrigation.',
    ),
    ev('land', 'land.parcel.updated.v1', 'normal', 'Farm boundaries and areas come from the land register.'),
    ev(
      'land',
      'land.zoning.changed.v1',
      'normal',
      'Agricultural land converted to another use leaves the water demand model.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'normal',
      'Irrigation programmes and compensation move with approved funding.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Under drought crisis the grid switches to allocation rather than demand-following.',
    ),
    ev(
      'smart-trade',
      'trade.export-opportunity.detected.v1',
      'normal',
      'Export demand changes which crops are worth the water.',
    ),
    ev(
      'research',
      'research.finding.released.v1',
      'normal',
      'Agronomy and water results are adopted directly by the farm twin.',
    ),
    ev(
      'health',
      'health.epidemic-signal.detected.v1',
      'normal',
      'Water-borne health signals point back at a water asset.',
    ),
    ev(
      'national-digital-twin',
      'twin.state.updated.v1',
      'normal',
      'Regional state gives the demand context a single farm cannot see.',
    ),
    // No synchronous call to Land: Land already calls this service for the
    // irrigation plan, and `land.parcel.updated.v1` above covers this direction.
  ],

  // ------------------------------------------------------ skills-opportunity
  'skills-opportunity': [
    ev(
      'education',
      'education.program.updated.v1',
      'critical',
      'Programmes are the supply side of the skills graph.',
    ),
    ev(
      'education',
      'education.learning-progress.updated.v1',
      'normal',
      'Cohort mastery is how supply becomes real rather than enrolled.',
    ),
    ev(
      'research',
      'research.project.published.v1',
      'normal',
      'Research activity is an advanced-skill demand signal.',
    ),
    ev(
      'research',
      'research.transfer.matched.v1',
      'normal',
      'A technology transfer creates a specific, datable skill need.',
    ),
    ev(
      'industrial-energy',
      'industry.production.updated.v1',
      'critical',
      'Industrial activity is the largest single source of skill demand.',
    ),
    ev(
      'food-water',
      'agriculture.yield.forecast.v1',
      'normal',
      'Agricultural seasons drive predictable seasonal skill demand.',
    ),
    ev(
      'smart-trade',
      'trade.export-opportunity.detected.v1',
      'critical',
      'An export opening is a skill requirement with a deadline.',
    ),
    ev(
      'infrastructure',
      'infrastructure.maintenance.scheduled.v1',
      'normal',
      'Scheduled works are dated demand for named trades.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'normal',
      'Chronic saturation is a health workforce gap, not only a bed gap.',
    ),
    ev('treasury', 'treasury.funding.approved.v1', 'normal', 'A funded programme is a hiring plan.'),
    ev(
      'tourism',
      'tourism.visitor-flow.updated.v1',
      'normal',
      'Seasonal tourism demand is seasonal skill demand.',
    ),
    ev(
      'global-tunisia',
      'global.diaspora-signal.updated.v1',
      'normal',
      'Skills concentrated abroad are supply the national graph should count.',
    ),
    ev(
      'talent',
      'talent.performance.updated.v1',
      'normal',
      'Youth pipelines feed both sport and the wider opportunity network.',
    ),
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'critical',
      'Micro-missions are placed where mobility is blocked, not where it is easy.',
    ),
    api(
      'research',
      'GET /capability',
      'normal',
      'Research capability is read when a career path targets an advanced domain.',
    ),
  ],

  // ----------------------------------------------------------------- health
  health: [
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'critical',
      'Respiratory admissions follow particulate load with a short, known lag.',
    ),
    ev(
      'environment',
      'environment.water-quality.updated.v1',
      'critical',
      'Water-borne disease surveillance starts at the water station, not at the ward.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'normal',
      'Heat risk is a direct predictor of emergency load in vulnerable cohorts.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Wearable and facility observations feed the cohort and hospital twins.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'critical',
      'Incoming casualties are known from the incident, before they arrive.',
    ),
    ev(
      'mobility-logistics',
      'transport.resource.dispatched.v1',
      'critical',
      'The hospital needs the ETA of what is coming to it.',
    ),
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'critical',
      'Vulnerable cohorts need outreach, not availability.',
    ),
    ev(
      'food-water',
      'agriculture.water-shortage.predicted.v1',
      'normal',
      'Water shortage has a documented health consequence within weeks.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'School air quality and crowding are paediatric health signals.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Crisis mode changes triage rules and capacity reporting frequency.',
    ),
    ev(
      'life-care',
      'care.facility-capacity.updated.v1',
      'critical',
      'Discharge to a care facility is what frees a hospital bed.',
    ),
    ev(
      'industrial-energy',
      'energy.outage-risk.flagged.v1',
      'critical',
      'An ICU without power is an evacuation, planned in advance or not at all.',
    ),
    ev(
      'tourism',
      'tourism.visitor-flow.updated.v1',
      'normal',
      'Seasonal population changes the denominator of every capacity ratio.',
    ),
    ev(
      'talent',
      'talent.injury-risk.flagged.v1',
      'normal',
      'Sports injury load is predictable and lands in the same emergency rooms.',
    ),
    api(
      'mobility-logistics',
      'GET /resources/nearest',
      'critical',
      'Inter-hospital transfer starts by finding the closest available ambulance.',
    ),
    api(
      'environment',
      'GET /air-quality',
      'normal',
      'Live air quality when an epidemic scan is run on demand.',
    ),
  ],

  // -------------------------------------------------------------- education
  education: [
    ev(
      'skills-opportunity',
      'skills.gap.detected.v1',
      'critical',
      'A detected gap is the reason a programme is adapted; this is the core loop.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'School air quality, occupancy and temperature are the school twin.',
    ),
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'critical',
      'Poor air in a school is a decision to take today, not a statistic.',
    ),
    ev(
      'infrastructure',
      'infrastructure.asset-health.updated.v1',
      'critical',
      'A school building is an infrastructure asset with a health index.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'normal',
      'A predicted building failure means relocating pupils, with notice.',
    ),
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'critical',
      'Dropout risk is a social signal before it is an academic one.',
    ),
    ev(
      'research',
      'research.finding.released.v1',
      'normal',
      'Pedagogy and curriculum results enter the knowledge graph.',
    ),
    ev(
      'treasury',
      'treasury.budget-line.updated.v1',
      'normal',
      'Class sizes and equipment follow the education budget line.',
    ),
    ev(
      'health',
      'health.epidemic-signal.detected.v1',
      'critical',
      'School closure and reopening decisions follow the health signal.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'normal',
      'School transport is a large, predictable share of morning demand.',
    ),
    ev(
      'culture',
      'culture.event.scheduled.v1',
      'normal',
      'Cultural programming is part of the school calendar.',
    ),
    ev(
      'industrial-energy',
      'industry.production.updated.v1',
      'normal',
      'Local industry defines which vocational tracks have a local outlet.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Schools become shelters; the education system must know first.',
    ),
    ev(
      'talent',
      'talent.facility-usage.updated.v1',
      'normal',
      'Sports facilities are shared with schools and scheduled against them.',
    ),
    api(
      'skills-opportunity',
      'GET /gaps',
      'critical',
      'Programme adaptation reads live regional gaps rather than the last event.',
    ),
  ],

  // --------------------------------------------------------------- research
  research: [
    ev(
      'skills-opportunity',
      'skills.gap.detected.v1',
      'normal',
      'A persistent national gap is a research and training agenda.',
    ),
    ev(
      'food-water',
      'agriculture.water-shortage.predicted.v1',
      'critical',
      'Water scarcity is the most funded applied research question in the country.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'critical',
      'Climate projections set the agenda of the living labs.',
    ),
    ev(
      'health',
      'health.epidemic-signal.detected.v1',
      'critical',
      'An epidemic signal is a research trigger with a deadline.',
    ),
    ev(
      'industrial-energy',
      'industry.symbiosis.matched.v1',
      'normal',
      'Symbiosis matches are process research made concrete.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'normal',
      'Materials and structural research follows real failure modes.',
    ),
    ev(
      'education',
      'education.program.updated.v1',
      'normal',
      'Programmes and research capability must stay in the same graph.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'critical',
      'A research project without approved funding is a proposal.',
    ),
    ev(
      'national-digital-twin',
      'twin.scenario.completed.v1',
      'normal',
      'Scenario gaps are exactly where research is missing.',
    ),
    ev(
      'land',
      'land.site-suitability.scored.v1',
      'normal',
      'Living lab sites are chosen by land suitability.',
    ),
    ev(
      'smart-trade',
      'trade.supply-risk.flagged.v1',
      'normal',
      'A supply dependency at risk is a substitution research problem.',
    ),
    ev(
      'global-tunisia',
      'global.diaspora-signal.updated.v1',
      'normal',
      'Diaspora researchers are a large part of national research capability.',
    ),
    ev(
      'culture',
      'culture.asset-condition.updated.v1',
      'normal',
      'Conservation science is driven by measured asset degradation.',
    ),
    ev(
      'talent',
      'talent.injury-risk.flagged.v1',
      'normal',
      'Sports science is applied physiology research with a live dataset.',
    ),
    // No synchronous call to Skills: Skills already calls Research for
    // capability, and the gap event above is the same information, pushed.
  ],

  // ----------------------------------------------------------------- talent
  talent: [
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Wearable and occupancy observations are the athlete and facility twins.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'normal',
      'Sports medicine capacity gates both competition and training volume.',
    ),
    ev(
      'education',
      'education.learning-progress.updated.v1',
      'normal',
      'School sport is where the pipeline actually starts.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'School facilities are the majority of accessible sports infrastructure.',
    ),
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'critical',
      'Outdoor training on a high-particulate day is a measurable injury and health risk.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'normal',
      'Heat risk decides whether a session is held at all.',
    ),
    ev(
      'infrastructure',
      'infrastructure.asset-health.updated.v1',
      'critical',
      'A stadium is an infrastructure asset before it is a venue.',
    ),
    ev(
      'industrial-energy',
      'energy.grid-load.updated.v1',
      'normal',
      'Facility energy use is measured against the grid it sits on.',
    ),
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'critical',
      'Youth opportunity is targeted where mobility is blocked.',
    ),
    ev(
      'skills-opportunity',
      'skills.micro-mission.published.v1',
      'normal',
      'Youth missions and sports pipelines share the same participants.',
    ),
    ev(
      'culture',
      'culture.event.scheduled.v1',
      'normal',
      'Venues and calendars are shared with cultural programming.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'normal',
      'Match-day mobility is planned, not absorbed.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'normal',
      'Crowd incidents at venues change facility operating rules.',
    ),
    ev(
      'treasury',
      'treasury.budget-line.updated.v1',
      'normal',
      'Facility maintenance and youth programmes follow the budget line.',
    ),
    api(
      'health',
      'GET /capacity',
      'normal',
      'Live medical capacity is checked before a large event is confirmed.',
    ),
  ],

  // ----------------------------------------------------- religious-heritage
  'religious-heritage': [
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Humidity, vibration and strain observations are the site condition twin.',
    ),
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'critical',
      'Particulates and pollutants are the main slow destroyer of historic fabric.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'critical',
      'Humidity and flood risk decide conservation priority.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'critical',
      'Historic buildings are infrastructure assets with irreplaceable value.',
    ),
    ev(
      'infrastructure',
      'infrastructure.maintenance.scheduled.v1',
      'normal',
      'Conservation work is scheduled through the same maintenance system.',
    ),
    ev(
      'industrial-energy',
      'energy.grid-load.updated.v1',
      'normal',
      'Site energy systems are optimised against the local grid.',
    ),
    ev(
      'culture',
      'culture.asset-condition.updated.v1',
      'critical',
      'Many sites are both religious and cultural assets; conditions must agree.',
    ),
    ev(
      'tourism',
      'tourism.visitor-flow.updated.v1',
      'critical',
      'Visitor pressure is the fastest controllable driver of degradation.',
    ),
    ev(
      'tourism',
      'tourism.site-pressure.detected.v1',
      'critical',
      'Over-capacity is the signal that access must be regulated.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'normal',
      'Access flows around historic quarters are a conservation variable.',
    ),
    ev(
      'research',
      'research.finding.released.v1',
      'normal',
      'Conservation science results are adopted directly by the sensor network.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'normal',
      'Fire and structural incidents at sites need an immediate, specific response.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'normal',
      'Restoration programmes exist only once funded.',
    ),
    ev(
      'education',
      'education.program.updated.v1',
      'normal',
      'Heritage education programmes are built on the knowledge graph.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Historic sites are protection and evacuation priorities the moment a crisis is declared.',
    ),
    ev(
      'land',
      'land.zoning.changed.v1',
      'normal',
      'What may be built next to a protected site is decided by zoning around it.',
    ),
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'normal',
      'Zaouias and madrasas remain community services in the most fragile neighbourhoods.',
    ),
    ev(
      'national-digital-twin',
      'twin.state.updated.v1',
      'normal',
      'Regional state orders the conservation queue between governorates.',
    ),
    api(
      'culture',
      'GET /assets/condition',
      'normal',
      'Shared assets are reconciled against Culture own condition record.',
    ),
  ],

  // ------------------------------------------------ digital-nervous-system
  'digital-nervous-system': [
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'normal',
      'Station readings validate the fabric against an independent publication.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'normal',
      'Incidents localise where edge capacity must be reinforced.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Crisis mode changes edge routing to store-and-forward.',
    ),
    ev(
      'resilience',
      'resilience.mesh-node.status.v1',
      'critical',
      'Mesh nodes are edge nodes seen by the ministry that deploys them.',
    ),
    ev(
      'infrastructure',
      'infrastructure.asset-health.updated.v1',
      'critical',
      'Telecom sites are infrastructure assets; their health is fabric health.',
    ),
    ev(
      'industrial-energy',
      'energy.grid-load.updated.v1',
      'critical',
      'An edge node without power is an edge node that is gone.',
    ),
    ev(
      'mobility-logistics',
      'transport.resource.dispatched.v1',
      'normal',
      'Moving resources carry sensors that join and leave the fabric.',
    ),
    ev(
      'food-water',
      'water.reservoir-level.updated.v1',
      'normal',
      'Confirms that water sensors registered here are producing usable values.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'normal',
      'Facility connectivity is prioritised by criticality of the facility.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'School connectivity is a fabric coverage question.',
    ),
    ev('land', 'land.parcel.updated.v1', 'normal', 'Sensor and node siting is a land question.'),
    ev(
      'research',
      'research.finding.released.v1',
      'normal',
      'Edge inference and networking results are deployed on the fabric.',
    ),
    ev(
      'national-digital-twin',
      'twin.anomaly.detected.v1',
      'normal',
      'An anomaly across sensors is often a fabric fault, not a real event.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'normal',
      'Coverage extension programmes follow approved funding.',
    ),
    ev(
      'tourism',
      'tourism.site-pressure.detected.v1',
      'normal',
      'Crowded sites are where public connectivity is most contested.',
    ),
  ],

  // ----------------------------------------------------- mobility-logistics
  'mobility-logistics': [
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'critical',
      'An incident closes lanes and pulls resources; both are mobility facts.',
    ),
    ev(
      'safety-emergency',
      'emergency.resource.requested.v1',
      'critical',
      'Emergency resource requests are dispatch orders for Transport.',
    ),
    ev(
      'health',
      'health.emergency.declared.v1',
      'critical',
      'A health emergency is a transport mission with a clock.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'critical',
      'A resource is only correctly routed if the destination can receive it.',
    ),
    ev(
      'resilience',
      'resilience.resource-request.created.v1',
      'critical',
      'Relief convoys are planned from crisis resource requests.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Crisis mode reprioritises the entire fleet.',
    ),
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'normal',
      'Traffic is both a cause and a victim of poor air; both feed the corridor twin.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'normal',
      'Flood and heat risk close corridors before any incident is reported.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Traffic flow and GPS observations are the mobility twin.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'critical',
      'A predicted bridge failure removes a corridor from every route.',
    ),
    ev(
      'infrastructure',
      'infrastructure.maintenance.scheduled.v1',
      'critical',
      'Planned works are planned congestion.',
    ),
    ev(
      'smart-trade',
      'trade.shipment.updated.v1',
      'critical',
      'Freight planning starts from the shipments that exist.',
    ),
    ev(
      'culture',
      'culture.event.scheduled.v1',
      'normal',
      'A scheduled gathering is a demand spike with a known location and hour.',
    ),
    ev(
      'tourism',
      'tourism.visitor-flow.updated.v1',
      'normal',
      'Seasonal visitor flows reshape corridor demand.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'School location and status drive school transport planning.',
    ),
    ev(
      'food-water',
      'agriculture.yield.forecast.v1',
      'normal',
      'Harvest volumes are freight demand with a season.',
    ),
    api(
      'environment',
      'GET /air-quality',
      'normal',
      'Air quality is read when a corridor plan is produced interactively.',
    ),
  ],

  // --------------------------------------------------------- infrastructure
  infrastructure: [
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Vibration, strain and water-level observations are the asset health index.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'critical',
      'Flood and heat risk are the dominant accelerators of asset degradation.',
    ),
    ev(
      'environment',
      'environment.water-quality.updated.v1',
      'normal',
      'Water chemistry drives corrosion in networks and structures.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'critical',
      'Load is what wears a road; demand is the load.',
    ),
    ev(
      'mobility-logistics',
      'transport.congestion.detected.v1',
      'normal',
      'Chronic congestion marks the segments that fail first.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'critical',
      'Incidents on an asset are the strongest evidence its health index is wrong.',
    ),
    ev(
      'industrial-energy',
      'energy.grid-load.updated.v1',
      'critical',
      'Power lines and substations are infrastructure assets under electrical load.',
    ),
    ev(
      'food-water',
      'agriculture.water-demand.predicted.v1',
      'critical',
      'Water networks are sized and stressed by demand.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'critical',
      'A maintenance order without funding is a wish.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Crisis reprioritises maintenance towards what the response depends on.',
    ),
    ev(
      'land',
      'land.zoning.changed.v1',
      'normal',
      'New zoning creates infrastructure obligations before it creates buildings.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'School buildings are part of the public asset base.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'normal',
      'Hospitals are critical assets; their continuity sets maintenance priority.',
    ),
    ev(
      'religious-heritage',
      'heritage.site-condition.updated.v1',
      'normal',
      'Historic structures need maintenance rules of their own, from the same system.',
    ),
    ev(
      'tourism',
      'tourism.site-pressure.detected.v1',
      'normal',
      'Visitor load is structural load on stairs, walkways and quays.',
    ),
    api(
      'mobility-logistics',
      'GET /flows',
      'normal',
      'Traffic load is read when an asset health index is recomputed.',
    ),
  ],

  // ------------------------------------------------------------------- land
  land: [
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'critical',
      'Flood and drought risk are hard constraints on any siting score.',
    ),
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'normal',
      'Air quality is a constraint on residential and school siting.',
    ),
    ev(
      'food-water',
      'agriculture.water-demand.predicted.v1',
      'critical',
      'Water availability decides whether agricultural zoning is viable.',
    ),
    ev(
      'food-water',
      'agriculture.water-shortage.predicted.v1',
      'critical',
      'A shortage forecast should freeze water-intensive siting decisions.',
    ),
    ev(
      'infrastructure',
      'infrastructure.asset-health.updated.v1',
      'critical',
      'A site is only suitable if the networks reaching it are.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'critical',
      'Accessibility is one of the strongest terms in a suitability score.',
    ),
    ev(
      'industrial-energy',
      'industry.production.updated.v1',
      'normal',
      'Industrial activity defines the real use of industrial zoning.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'normal',
      'Repeated incidents on a parcel are a siting constraint.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'normal',
      'Crisis staging areas are drawn from the public asset register.',
    ),
    ev(
      'treasury',
      'treasury.budget-line.updated.v1',
      'normal',
      'Public asset valuation and the budget move together.',
    ),
    ev(
      'tourism',
      'tourism.site-pressure.detected.v1',
      'normal',
      'Touristic zoning pressure is measured, not assumed.',
    ),
    ev(
      'culture',
      'culture.asset-condition.updated.v1',
      'normal',
      'Protected cultural assets constrain neighbouring parcels.',
    ),
    ev(
      'education',
      'education.school-condition.updated.v1',
      'normal',
      'School siting is a land decision with a 40-year horizon.',
    ),
    ev(
      'national-digital-twin',
      'twin.scenario.completed.v1',
      'normal',
      'Scenario outcomes are usually expressed as land decisions.',
    ),
    api(
      'food-water',
      'GET /irrigation/plan',
      'normal',
      'Water plans are read directly when an agricultural site is evaluated.',
    ),
  ],

  // ------------------------------------------------------------ environment
  environment: [
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Air, water, noise and weather observations ARE the environmental network.',
    ),
    ev(
      'industrial-energy',
      'industry.production.updated.v1',
      'critical',
      'Industrial output is the main attributable source of emissions.',
    ),
    ev(
      'industrial-energy',
      'energy.grid-load.updated.v1',
      'normal',
      'Generation mix decides the emission intensity of every kilowatt-hour.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'critical',
      'Traffic is the second attributable source of urban air pollution.',
    ),
    ev(
      'mobility-logistics',
      'transport.congestion.detected.v1',
      'normal',
      'Congestion multiplies emissions per kilometre travelled.',
    ),
    ev(
      'food-water',
      'agriculture.water-demand.predicted.v1',
      'critical',
      'Abstraction is the largest pressure on the water balance.',
    ),
    ev(
      'food-water',
      'water.reservoir-level.updated.v1',
      'critical',
      'Reservoir levels are the observable half of the drought index.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'normal',
      'Sewage and network failures are pollution events waiting to happen.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'critical',
      'Industrial and fire incidents are acute pollution events.',
    ),
    ev(
      'smart-trade',
      'trade.product-passport.issued.v1',
      'normal',
      'Product footprints and the national inventory must reconcile.',
    ),
    ev(
      'tourism',
      'tourism.site-pressure.detected.v1',
      'normal',
      'Concentrated visitors are a local environmental pressure.',
    ),
    ev(
      'land',
      'land.zoning.changed.v1',
      'normal',
      'Land-use change is the slowest and largest environmental driver.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'normal',
      'Crisis mode raises sampling frequency in the affected zone.',
    ),
    ev(
      'research',
      'research.finding.released.v1',
      'normal',
      'Measurement and modelling results are adopted by the climate twin.',
    ),
    ev(
      'culture',
      'culture.event.scheduled.v1',
      'normal',
      'Large events produce a measurable, plannable waste stream.',
    ),
    api(
      'industrial-energy',
      'GET /grid/load',
      'normal',
      'Live generation mix when a climate projection is computed on demand.',
    ),
  ],

  // ---------------------------------------------------------------- tourism
  tourism: [
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'critical',
      'A bad air day is a bad visit; itineraries route around it.',
    ),
    ev(
      'environment',
      'environment.water-quality.updated.v1',
      'critical',
      'Bathing water quality decides whether a beach can be recommended at all.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'normal',
      'Heat risk reshapes the summer offer towards inland and evening options.',
    ),
    ev(
      'culture',
      'culture.event.scheduled.v1',
      'critical',
      'Cultural programming is the primary content of any itinerary.',
    ),
    ev(
      'culture',
      'culture.asset-condition.updated.v1',
      'critical',
      'A closed or fragile asset must leave the itinerary immediately.',
    ),
    ev(
      'religious-heritage',
      'heritage.site-condition.updated.v1',
      'critical',
      'Access limits at heritage sites are conservation decisions tourism must honour.',
    ),
    ev(
      'mobility-logistics',
      'transport.congestion.detected.v1',
      'critical',
      'Access time is the constraint that actually breaks an itinerary.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'normal',
      'Visitor flows and general mobility share the same corridors.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'normal',
      'Medical coverage is part of a responsible destination recommendation.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'critical',
      'An incident at or near a site suspends recommendations for it.',
    ),
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Occupancy and noise observations are the site pressure index.',
    ),
    ev(
      'global-tunisia',
      'global.diaspora-signal.updated.v1',
      'normal',
      'Diaspora travel is a distinct, forecastable segment.',
    ),
    ev(
      'infrastructure',
      'infrastructure.asset-health.updated.v1',
      'normal',
      'Access roads, quays and walkways gate site capacity.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'A crisis withdraws affected zones from every published itinerary.',
    ),
    ev(
      'talent',
      'talent.facility-usage.updated.v1',
      'normal',
      'Sporting events are a major and plannable driver of visitor flows.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'normal',
      'Destination promotion and site upgrades exist once funded.',
    ),
    api(
      'environment',
      'GET /air-quality',
      'critical',
      'Air quality is read at itinerary build time, not from the last event.',
    ),
  ],

  // -------------------------------------------------------------- life-care
  'life-care': [
    ev(
      'social-mobility',
      'social.vulnerability.updated.v1',
      'critical',
      'Vulnerability and care need are the same household from two angles.',
    ),
    ev(
      'social-mobility',
      'social.household-need.detected.v1',
      'critical',
      'A detected household need usually resolves into a care placement.',
    ),
    ev(
      'health',
      'health.capacity.updated.v1',
      'critical',
      'Discharge planning is only possible if hospital pressure is visible.',
    ),
    ev(
      'health',
      'health.care-episode.updated.v1',
      'critical',
      'A care episode ending is where the care network takes over.',
    ),
    ev(
      'education',
      'education.learning-progress.updated.v1',
      'normal',
      'Schooling is the main childhood life transition the journey tracks.',
    ),
    ev(
      'skills-opportunity',
      'skills.micro-mission.published.v1',
      'critical',
      'Economic independence is built out of real, paid missions.',
    ),
    ev(
      'treasury',
      'treasury.aid.disbursed.v1',
      'critical',
      'Aid arrival is the event that changes an independence trajectory.',
    ),
    ev(
      'justice',
      'justice.case.filed.v1',
      'normal',
      'Family and guardianship cases are life events with legal weight.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'normal',
      'An incident affecting a household is a care trigger.',
    ),
    ev(
      'resilience',
      'resilience.crisis.declared.v1',
      'critical',
      'Care facilities are evacuation-priority sites with dependent occupants.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'normal',
      'Heat waves are a documented mortality risk for elderly cohorts.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'normal',
      'Access to a care facility is a transport question for its users.',
    ),
    ev(
      'culture',
      'culture.event.scheduled.v1',
      'normal',
      'Cultural participation is part of elderly and youth care programming.',
    ),
    ev(
      'talent',
      'talent.facility-usage.updated.v1',
      'normal',
      'Youth clubs are shared between sport and care programming.',
    ),
    api(
      'social-mobility',
      'GET /vulnerability',
      'critical',
      'Coverage planning reads live vulnerability rather than the last event.',
    ),
  ],

  // ---------------------------------------------------------------- culture
  culture: [
    ev(
      'digital-nervous-system',
      'iot.sensor.observation.v1',
      'critical',
      'Humidity, temperature and vibration observations are the asset condition twin.',
    ),
    ev(
      'environment',
      'environment.air-quality.updated.v1',
      'critical',
      'Pollution is the slow destroyer of monuments and open-air sites.',
    ),
    ev(
      'environment',
      'environment.climate-risk.updated.v1',
      'critical',
      'Flood and humidity risk set the conservation queue.',
    ),
    ev(
      'tourism',
      'tourism.visitor-flow.updated.v1',
      'critical',
      'Visitor load is the main controllable pressure on cultural assets.',
    ),
    ev(
      'tourism',
      'tourism.site-pressure.detected.v1',
      'critical',
      'Over-capacity means restricting access, which Culture decides.',
    ),
    ev(
      'religious-heritage',
      'heritage.site-condition.updated.v1',
      'critical',
      'Shared assets must not carry two contradictory condition records.',
    ),
    ev(
      'infrastructure',
      'infrastructure.failure.predicted.v1',
      'critical',
      'Museums and monuments are buildings with predictable failure modes.',
    ),
    ev(
      'mobility-logistics',
      'transport.mobility-demand.updated.v1',
      'normal',
      'Event planning needs the corridor picture before the date is fixed.',
    ),
    ev(
      'education',
      'education.program.updated.v1',
      'normal',
      'Cultural education programmes and the asset register are planned together.',
    ),
    ev(
      'skills-opportunity',
      'skills.gap.detected.v1',
      'normal',
      'Conservation and creative trades are a measurable national skill gap.',
    ),
    ev(
      'treasury',
      'treasury.funding.approved.v1',
      'critical',
      'Restoration and creative programmes exist once funded.',
    ),
    ev(
      'safety-emergency',
      'emergency.incident.created.v1',
      'critical',
      'Fire or flood at a cultural asset is irreversible; response must be immediate.',
    ),
    ev(
      'research',
      'research.finding.released.v1',
      'normal',
      'Conservation science results change how assets are treated.',
    ),
    ev(
      'global-tunisia',
      'global.opportunity.published.v1',
      'normal',
      'Diaspora audiences and funding are part of the creative economy.',
    ),
    api('tourism', 'GET /flows', 'normal', 'Visitor pressure is read when a cultural event is planned.'),
  ],
};
