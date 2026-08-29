/**
 * INCOMING EVENTS — National Land Intelligence System
 *
 * 14 relations, every one of them declared in
 * architecture/relations.yaml with a stated purpose. They are already WIRED:
 * each signal is stored the moment it arrives, so `GET /api/land/signals`
 * shows real traffic from other ministries before you write a line.
 *
 * What is deliberately NOT written for you is the reaction. That is the feature.
 */
import { rememberSignal, type ConsumerDefinition } from '@platform/service-kit';

export const consumers: ConsumerDefinition[] = [
  {
    event: 'environment.climate-risk.updated.v1',
    from: 'environment',
    reason: 'Flood and drought risk are hard constraints on any siting score.',
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
    event: 'environment.air-quality.updated.v1',
    from: 'environment',
    reason: 'Air quality is a constraint on residential and school siting.',
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
    event: 'agriculture.water-demand.predicted.v1',
    from: 'food-water',
    reason: 'Water availability decides whether agricultural zoning is viable.',
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
    event: 'agriculture.water-shortage.predicted.v1',
    from: 'food-water',
    reason: 'A shortage forecast should freeze water-intensive siting decisions.',
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
    event: 'infrastructure.asset-health.updated.v1',
    from: 'infrastructure',
    reason: 'A site is only suitable if the networks reaching it are.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'infrastructure.asset-health.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'transport.mobility-demand.updated.v1',
    from: 'mobility-logistics',
    reason: 'Accessibility is one of the strongest terms in a suitability score.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'transport.mobility-demand.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'industry.production.updated.v1',
    from: 'industrial-energy',
    reason: 'Industrial activity defines the real use of industrial zoning.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'industry.production.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'emergency.incident.created.v1',
    from: 'safety-emergency',
    reason: 'Repeated incidents on a parcel are a siting constraint.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'emergency.incident.created.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'resilience.crisis.declared.v1',
    from: 'resilience',
    reason: 'Crisis staging areas are drawn from the public asset register.',
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
    event: 'treasury.budget-line.updated.v1',
    from: 'treasury',
    reason: 'Public asset valuation and the budget move together.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'treasury.budget-line.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'tourism.site-pressure.detected.v1',
    from: 'tourism',
    reason: 'Touristic zoning pressure is measured, not assumed.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'tourism.site-pressure.detected.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'culture.asset-condition.updated.v1',
    from: 'culture',
    reason: 'Protected cultural assets constrain neighbouring parcels.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'culture.asset-condition.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'education.school-condition.updated.v1',
    from: 'education',
    reason: 'School siting is a land decision with a 40-year horizon.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'education.school-condition.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'twin.scenario.completed.v1',
    from: 'national-digital-twin',
    reason: 'Scenario outcomes are usually expressed as land decisions.',
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
