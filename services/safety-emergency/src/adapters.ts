/**
 * OUTGOING API DEPENDENCIES — National Safety & Emergency Grid
 *
 * Every synchronous call this ministry makes to another one, declared in
 * architecture/relations.yaml and implemented here. Nothing else in this
 * service should call `ctx.platform` directly: keeping the calls in one file
 * is what makes GET /dependencies able to tell a student, in one screen, which
 * integration is broken.
 */
import type { ServiceContext } from '@platform/service-kit';

export interface ApiDependency {
  service: string;
  route: string;
  criticality: 'critical' | 'normal';
  reason: string;
}

export const API_DEPENDENCIES: ApiDependency[] = [
  {
    service: 'mobility-logistics',
    route: 'POST /dispatch',
    criticality: 'critical',
    reason: 'Every ambulance, truck and boat belongs to Transport; dispatch is a call, not a database write.',
  },
  {
    service: 'health',
    route: 'GET /capacity',
    criticality: 'critical',
    reason: 'Triage decides a destination facility, which requires live capacity.',
  },
];

export interface DependencyStatus extends ApiDependency {
  running: boolean;
  reachable: boolean;
  detail?: string;
}

/** Used by GET /dependencies and by the student portal's broken-integration panel. */
export async function checkDependencies(ctx: ServiceContext): Promise<DependencyStatus[]> {
  return Promise.all(
    API_DEPENDENCIES.map(async (dependency) => {
      const running = ctx.platform.isAvailable(dependency.service);
      if (!running) {
        return {
          ...dependency,
          running: false,
          reachable: false,
          detail: `${dependency.service} is not running. Start it with: pnpm dev`,
        };
      }
      const probe = await ctx.platform.tryCall(dependency.service, 'GET /health');
      return {
        ...dependency,
        running: true,
        reachable: probe.ok,
        detail: probe.ok ? undefined : probe.reason,
      };
    }),
  );
}

/**
 * Every ambulance, truck and boat belongs to Transport; dispatch is a call, not a database write.
 *
 * Criticality: critical. Uses `tryCall`, so if mobility-logistics is not
 * running you get `{ ok: false, degraded: true }` and a readable reason —
 * never a crash and never a connection error in a student's face (§28).
 */
export async function fromMobilityLogisticsDispatch(
  ctx: ServiceContext,
  options: { query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {},
) {
  return ctx.platform.tryCall('mobility-logistics', 'POST /dispatch', {
    ...options,
    relation: 'safety-emergency -> mobility-logistics (POST /dispatch)',
  });
}

/**
 * Triage decides a destination facility, which requires live capacity.
 *
 * Criticality: critical. Uses `tryCall`, so if health is not
 * running you get `{ ok: false, degraded: true }` and a readable reason —
 * never a crash and never a connection error in a student's face (§28).
 */
export async function fromHealthCapacity(
  ctx: ServiceContext,
  options: { query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {},
) {
  return ctx.platform.tryCall('health', 'GET /capacity', {
    ...options,
    relation: 'safety-emergency -> health (GET /capacity)',
  });
}
