/**
 * OUTGOING API DEPENDENCIES — Autonomous Mobility & Logistics Grid
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
    service: 'environment',
    route: 'GET /air-quality',
    criticality: 'normal',
    reason: 'Air quality is read when a corridor plan is produced interactively.',
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
 * Air quality is read when a corridor plan is produced interactively.
 *
 * Criticality: normal. Uses `tryCall`, so if environment is not
 * running you get `{ ok: false, degraded: true }` and a readable reason —
 * never a crash and never a connection error in a student's face (§28).
 */
export async function fromEnvironmentAirQuality(
  ctx: ServiceContext,
  options: { query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {},
) {
  return ctx.platform.tryCall('environment', 'GET /air-quality', {
    ...options,
    relation: 'mobility-logistics -> environment (GET /air-quality)',
  });
}
