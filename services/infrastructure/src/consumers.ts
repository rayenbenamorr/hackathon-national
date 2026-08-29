/**
 * INCOMING EVENTS — Smart Infrastructure OS
 *
 * 15 relations, every one of them declared in
 * architecture/relations.yaml with a stated purpose. They are already WIRED:
 * each signal is stored the moment it arrives, so `GET /api/infrastructure/signals`
 * shows real traffic from other ministries before you write a line.
 *
 * What is deliberately NOT written for you is the reaction. That is the feature.
 */
import { rememberSignal, applyObservationToTwins, type ConsumerDefinition } from '@platform/service-kit';

export const consumers: ConsumerDefinition[] = [
  {
    event: 'iot.sensor.observation.v1',
    from: 'digital-nervous-system',
    reason: 'Vibration, strain and water-level observations are the asset health index.',
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
    event: 'environment.climate-risk.updated.v1',
    from: 'environment',
    reason: 'Flood and heat risk are the dominant accelerators of asset degradation.',
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
    event: 'environment.water-quality.updated.v1',
    from: 'environment',
    reason: 'Water chemistry drives corrosion in networks and structures.',
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
    event: 'transport.mobility-demand.updated.v1',
    from: 'mobility-logistics',
    reason: 'Load is what wears a road; demand is the load.',
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
    event: 'transport.congestion.detected.v1',
    from: 'mobility-logistics',
    reason: 'Chronic congestion marks the segments that fail first.',
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
    event: 'emergency.incident.created.v1',
    from: 'safety-emergency',
    reason: 'Incidents on an asset are the strongest evidence its health index is wrong.',
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
    event: 'energy.grid-load.updated.v1',
    from: 'industrial-energy',
    reason: 'Power lines and substations are infrastructure assets under electrical load.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'energy.grid-load.updated.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'agriculture.water-demand.predicted.v1',
    from: 'food-water',
    reason: 'Water networks are sized and stressed by demand.',
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
    event: 'treasury.funding.approved.v1',
    from: 'treasury',
    reason: 'A maintenance order without funding is a wish.',
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
    reason: 'Crisis reprioritises maintenance towards what the response depends on.',
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
    event: 'land.zoning.changed.v1',
    from: 'land',
    reason: 'New zoning creates infrastructure obligations before it creates buildings.',
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, 'land.zoning.changed.v1');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },
  {
    event: 'education.school-condition.updated.v1',
    from: 'education',
    reason: 'School buildings are part of the public asset base.',
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
    event: 'health.capacity.updated.v1',
    from: 'health',
    reason: 'Hospitals are critical assets; their continuity sets maintenance priority.',
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
    event: 'heritage.site-condition.updated.v1',
    from: 'religious-heritage',
    reason: 'Historic structures need maintenance rules of their own, from the same system.',
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
    event: 'tourism.site-pressure.detected.v1',
    from: 'tourism',
    reason: 'Visitor load is structural load on stairs, walkways and quays.',
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
];
