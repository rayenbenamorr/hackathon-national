/**
 * INCOMING EVENTS — Industrial & Energy Intelligence Grid
 *
 * 14 relations, every one of them declared in
 * architecture/relations.yaml with a stated purpose. They are already WIRED:
 * each signal is stored the moment it arrives, so `GET /api/industrial-energy/signals`
 * shows real traffic from other ministries before you write a line.
 *
 * What is deliberately NOT written for you is the reaction. That is the feature.
 */
import { rememberSignal, applyObservationToTwins, type ConsumerDefinition } from '@platform/service-kit';

export const consumers: ConsumerDefinition[] = [
  {
    event: 'environment.air-quality.updated.v1',
    from: 'environment',
    reason: 'Emissions constrain production; the plant twin must see its own consequence.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'environment.air-quality.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'environment.waste-stream.updated.v1',
    from: 'environment',
    reason: 'Waste streams are the raw material of the symbiosis engine.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'environment.waste-stream.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'environment.climate-risk.updated.v1',
    from: 'environment',
    reason: 'Heat risk changes both demand and generation capacity.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'environment.climate-risk.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'iot.sensor.observation.v1',
    from: 'digital-nervous-system',
    reason: 'Energy load and vibration observations are the grid and asset twins.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);
      // Sensor readings land on the twins this ministry keeps in the same governorate.
      applyObservationToTwins(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'iot.sensor.observation.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'agriculture.water-demand.predicted.v1',
    from: 'food-water',
    reason: 'Industry and agriculture compete for the same water and the same pumping energy.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'agriculture.water-demand.predicted.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'infrastructure.failure.predicted.v1',
    from: 'infrastructure',
    reason: 'A predicted power-line failure is an outage risk before it is a maintenance order.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'infrastructure.failure.predicted.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'logistics.freight.updated.v1',
    from: 'mobility-logistics',
    reason: 'Freight movement is the physical trace of industrial output.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'logistics.freight.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'trade.supply-risk.flagged.v1',
    from: 'smart-trade',
    reason: 'An input dependency at risk stops a production line.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'trade.supply-risk.flagged.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'treasury.funding.approved.v1',
    from: 'treasury',
    reason: 'Industrial and renewable programmes move with approved funding.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'treasury.funding.approved.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'resilience.crisis.declared.v1',
    from: 'resilience',
    reason: 'Crisis load-shedding priorities are set from the declaration.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'resilience.crisis.declared.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'research.finding.released.v1',
    from: 'research',
    reason: 'Process and materials results are adopted first by industry.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'research.finding.released.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'skills.gap.detected.v1',
    from: 'skills-opportunity',
    reason: 'Operator and maintenance shortages cap what the grid can safely run.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'skills.gap.detected.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'land.site-suitability.scored.v1',
    from: 'land',
    reason: 'Renewable siting is a land question before it is an energy question.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'land.site-suitability.scored.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'twin.scenario.completed.v1',
    from: 'national-digital-twin',
    reason: 'Scenario outcomes set the demand assumptions the grid plans against.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'twin.scenario.completed.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
];
