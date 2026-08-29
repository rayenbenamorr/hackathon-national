/**
 * OUTGOING API DEPENDENCIES — Tunisia Research Brain
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

export const API_DEPENDENCIES: ApiDependency[] = [];

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

// This ministry makes no synchronous cross-service calls; everything it needs arrives as events.
