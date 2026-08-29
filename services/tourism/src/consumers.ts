/**
 * INCOMING EVENTS — Tunisia Immersive Tourism OS
 *
 * 16 relations, every one of them declared in
 * architecture/relations.yaml with a stated purpose. They are already WIRED:
 * each signal is stored the moment it arrives, so `GET /api/tourism/signals`
 * shows real traffic from other ministries before you write a line.
 *
 * What is deliberately NOT written for you is the reaction. That is the feature.
 */
import { rememberSignal, applyObservationToTwins, type ConsumerDefinition } from '@platform/service-kit';

export const consumers: ConsumerDefinition[] = [
  {
    event: 'environment.air-quality.updated.v1',
    from: 'environment',
    reason: 'A bad air day is a bad visit; itineraries route around it.',
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
    event: 'environment.water-quality.updated.v1',
    from: 'environment',
    reason: 'Bathing water quality decides whether a beach can be recommended at all.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'environment.water-quality.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'environment.climate-risk.updated.v1',
    from: 'environment',
    reason: 'Heat risk reshapes the summer offer towards inland and evening options.',
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
    event: 'culture.event.scheduled.v1',
    from: 'culture',
    reason: 'Cultural programming is the primary content of any itinerary.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'culture.event.scheduled.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'culture.asset-condition.updated.v1',
    from: 'culture',
    reason: 'A closed or fragile asset must leave the itinerary immediately.',
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
    event: 'heritage.site-condition.updated.v1',
    from: 'religious-heritage',
    reason: 'Access limits at heritage sites are conservation decisions tourism must honour.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'heritage.site-condition.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'transport.congestion.detected.v1',
    from: 'mobility-logistics',
    reason: 'Access time is the constraint that actually breaks an itinerary.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'transport.congestion.detected.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'transport.mobility-demand.updated.v1',
    from: 'mobility-logistics',
    reason: 'Visitor flows and general mobility share the same corridors.',
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
    event: 'health.capacity.updated.v1',
    from: 'health',
    reason: 'Medical coverage is part of a responsible destination recommendation.',
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
    event: 'emergency.incident.created.v1',
    from: 'safety-emergency',
    reason: 'An incident at or near a site suspends recommendations for it.',
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
    event: 'iot.sensor.observation.v1',
    from: 'digital-nervous-system',
    reason: 'Occupancy and noise observations are the site pressure index.',
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
    event: 'global.diaspora-signal.updated.v1',
    from: 'global-tunisia',
    reason: 'Diaspora travel is a distinct, forecastable segment.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'global.diaspora-signal.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'infrastructure.asset-health.updated.v1',
    from: 'infrastructure',
    reason: 'Access roads, quays and walkways gate site capacity.',
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
    event: 'resilience.crisis.declared.v1',
    from: 'resilience',
    reason: 'A crisis withdraws affected zones from every published itinerary.',
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
    event: 'talent.facility-usage.updated.v1',
    from: 'talent',
    reason: 'Sporting events are a major and plannable driver of visitor flows.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'talent.facility-usage.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'treasury.funding.approved.v1',
    from: 'treasury',
    reason: 'Destination promotion and site upgrades exist once funded.',
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
];
