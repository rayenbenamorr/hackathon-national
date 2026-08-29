/**
 * OUTGOING API DEPENDENCIES — Environmental Nervous System
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
    service: 'industrial-energy',
    route: 'GET /grid/load',
    criticality: 'normal',
    reason: 'Live generation mix when a climate projection is computed on demand.',
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
 * Live generation mix when a climate projection is computed on demand.
 *
 * Criticality: normal. Uses `tryCall`, so if industrial-energy is not
 * running you get `{ ok: false, degraded: true }` and a readable reason —
 * never a crash and never a connection error in a student's face (§28).
 */
export async function fromIndustrialEnergyGridLoad(
  ctx: ServiceContext,
  options: { query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {},
) {
  return ctx.platform.tryCall('industrial-energy', 'GET /grid/load', {
    ...options,
    relation: 'environment -> industrial-energy (GET /grid/load)',
  });
}
