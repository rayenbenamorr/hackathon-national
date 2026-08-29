import { serviceIdentity, type Identity } from '@platform/auth';
import {
  newCorrelationId,
  newTraceId,
  recordHop,
  recordRelationFailure,
  type TraceContext,
} from '@platform/observability';
import { SERVICE_DIRECTORY } from '@platform/contracts';
import { DependencyUnavailableError, ServiceCallError } from './errors.ts';
import {
  allServiceEndpoints,
  isServiceRunning,
  serviceEndpoint,
  type PlatformRequest,
  type PlatformResponse,
} from './registry.ts';

export * from './registry.ts';
export * from './errors.ts';

export interface CallOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  trace?: TraceContext;
  identity?: Identity;
  /** Names the architecture relation this call implements — shown in the portal. */
  relation?: string;
}

export interface DegradedResult<T> {
  ok: false;
  degraded: true;
  reason: string;
  dependency: string;
  fallback?: T;
}
export interface OkResult<T> {
  ok: true;
  data: T;
}
export type TryResult<T> = OkResult<T> | DegradedResult<T>;

/**
 * THE ONLY LEGAL WAY FOR ONE MINISTRY TO REACH ANOTHER (§7).
 *
 * Two methods, and the difference between them is the whole failure doctrine:
 *
 *   call()     — I cannot do my job without this. Throws a 424 that names the
 *                missing ministry in a sentence a beginner can act on.
 *   tryCall()  — I can do a reduced job without it. Never throws; returns
 *                `{ ok: false, degraded: true }` plus an optional fallback,
 *                and the missed relation shows up in the portal as a broken
 *                integration instead of a crash.
 *
 * Most cross-ministry reads should be `tryCall`. A national platform where
 * Health goes down because Tourism is restarting is a worse platform.
 */
export interface PlatformClient {
  readonly caller: string;
  call<T = unknown>(service: string, route: string, options?: CallOptions): Promise<T>;
  tryCall<T = unknown>(
    service: string,
    route: string,
    options?: CallOptions & { fallback?: T },
  ): Promise<TryResult<T>>;
  isAvailable(service: string): boolean;
  running(): string[];
  directory(): typeof SERVICE_DIRECTORY;
}

function parseRoute(route: string): { method: PlatformRequest['method']; path: string } {
  const [rawMethod, rawPath] = route.trim().split(/\s+/);
  if (!rawPath) return { method: 'GET', path: rawMethod.startsWith('/') ? rawMethod : `/${rawMethod}` };
  return { method: rawMethod.toUpperCase() as PlatformRequest['method'], path: rawPath };
}

function humanName(service: string): string {
  return SERVICE_DIRECTORY[service as keyof typeof SERVICE_DIRECTORY]?.name ?? service;
}

export function createPlatformClient(caller: string): PlatformClient {
  const baseTrace = (): TraceContext => ({
    traceId: newTraceId(),
    correlationId: newCorrelationId(),
    sourceService: caller,
  });

  async function invoke(service: string, route: string, options: CallOptions): Promise<PlatformResponse> {
    const { method, path } = parseRoute(route);
    const trace = options.trace ?? baseTrace();
    const endpoint = serviceEndpoint(service);

    if (!endpoint) {
      const known = service in SERVICE_DIRECTORY;
      const reason = known
        ? 'the service is not running in this platform instance'
        : `there is no ministry service with the id "${service}"`;
      const hint = known
        ? `Start the whole platform with "pnpm dev", or "pnpm dev:service ${service}" for that one service alone.`
        : `Check the id against architecture/services.yaml — the 24 ids are listed there.`;

      recordRelationFailure({
        from: caller,
        to: service,
        reason,
        relation: options.relation ?? `${method} ${path}`,
        traceId: trace.traceId,
      });
      recordHop({
        traceId: trace.traceId,
        correlationId: trace.correlationId,
        kind: 'error',
        from: caller,
        to: service,
        label: `${method} ${path}`,
        ok: false,
        detail: { reason },
      });
      throw new DependencyUnavailableError(caller, service, humanName(service), reason, hint);
    }

    const query = Object.fromEntries(
      Object.entries(options.query ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    );

    const started = Date.now();
    const response = await endpoint.handle({
      method,
      path,
      query,
      body: options.body,
      identity: options.identity ?? serviceIdentity(caller),
      trace,
    });

    recordHop({
      traceId: trace.traceId,
      correlationId: trace.correlationId,
      kind: 'http',
      from: caller,
      to: service,
      label: `${method} ${path}`,
      durationMs: Date.now() - started,
      ok: response.status < 400,
      detail: { status: response.status, relation: options.relation },
    });

    return response;
  }

  return {
    caller,

    async call<T>(service: string, route: string, options: CallOptions = {}): Promise<T> {
      const response = await invoke(service, route, options);
      if (response.status >= 400) {
        const body = response.body as { message?: string } | undefined;
        throw new ServiceCallError(
          response.status,
          service,
          body?.message ?? `${humanName(service)} answered HTTP ${response.status} for ${route}.`,
          response.body,
        );
      }
      return response.body as T;
    },

    async tryCall<T>(
      service: string,
      route: string,
      options: CallOptions & { fallback?: T } = {},
    ): Promise<TryResult<T>> {
      try {
        const response = await invoke(service, route, options);
        if (response.status >= 400) {
          const body = response.body as { message?: string } | undefined;
          return {
            ok: false,
            degraded: true,
            dependency: service,
            reason: body?.message ?? `${humanName(service)} answered HTTP ${response.status}.`,
            fallback: options.fallback,
          };
        }
        return { ok: true, data: response.body as T };
      } catch (error) {
        return {
          ok: false,
          degraded: true,
          dependency: service,
          reason: error instanceof Error ? error.message : String(error),
          fallback: options.fallback,
        };
      }
    },

    isAvailable: (service) => isServiceRunning(service),
    running: () => allServiceEndpoints().map((e) => e.id),
    directory: () => SERVICE_DIRECTORY,
  };
}
