/**
 * INCOMING EVENTS — Intelligent Treasury OS
 *
 * 15 relations, every one of them declared in
 * architecture/relations.yaml with a stated purpose. They are already WIRED:
 * each signal is stored the moment it arrives, so `GET /api/treasury/signals`
 * shows real traffic from other ministries before you write a line.
 *
 * What is deliberately NOT written for you is the reaction. That is the feature.
 */
import { rememberSignal, type ConsumerDefinition } from '@platform/service-kit';

export const consumers: ConsumerDefinition[] = [
  {
    event: 'resilience.relief-plan.updated.v1',
    from: 'resilience',
    reason: 'A relief plan is a spending commitment; the treasury twin must see it as it forms.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'resilience.relief-plan.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'resilience.resource-request.created.v1',
    from: 'resilience',
    reason: 'Resource requests are funding requests wearing another name.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'resilience.resource-request.created.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'health.capacity.updated.v1',
    from: 'health',
    reason: 'Saturation is the earliest signal of an unbudgeted health cost.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'health.capacity.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'agriculture.water-shortage.predicted.v1',
    from: 'food-water',
    reason: 'Water shortage has a known fiscal shape: compensation, tankering, import.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'agriculture.water-shortage.predicted.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'infrastructure.failure.predicted.v1',
    from: 'infrastructure',
    reason: 'Predicted failure lets maintenance be budgeted instead of emergency-funded.',
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
    event: 'infrastructure.maintenance.scheduled.v1',
    from: 'infrastructure',
    reason: 'Scheduled work orders are the committed half of the infrastructure budget.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'infrastructure.maintenance.scheduled.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'social.household-need.detected.v1',
    from: 'social-mobility',
    reason: 'Detected need is what the aid wallet exists to answer.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'social.household-need.detected.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'energy.outage-risk.flagged.v1',
    from: 'industrial-energy',
    reason: 'Outage risk carries a subsidy and compensation exposure.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'energy.outage-risk.flagged.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'trade.supply-risk.flagged.v1',
    from: 'smart-trade',
    reason: 'Supply risk moves customs revenue and import cost together.',
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
    event: 'education.program.updated.v1',
    from: 'education',
    reason: 'A new programme is a recurring cost that must enter the fiscal year.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'education.program.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'justice.court-load.updated.v1',
    from: 'justice',
    reason: 'Court saturation is the justification for justice budget reallocation.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'justice.court-load.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'twin.scenario.completed.v1',
    from: 'national-digital-twin',
    reason: 'Scenario outcomes are costed before they are decided.',
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
  {
    event: 'emergency.incident.resolved.v1',
    from: 'safety-emergency',
    reason: 'Resolved incidents give the actual cost of response, not the estimate.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'emergency.incident.resolved.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'land.site-suitability.scored.v1',
    from: 'land',
    reason: 'Public asset valuation and investment siting share the same scores.',
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
    event: 'research.transfer.matched.v1',
    from: 'research',
    reason: 'A matched transfer is a funding decision waiting to be made.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'research.transfer.matched.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
];
