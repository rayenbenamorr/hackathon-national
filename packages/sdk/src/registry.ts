import type { ApiRouteMeta } from '@platform/contracts';
import type { Identity } from '@platform/auth';
import type { TraceContext } from '@platform/observability';

export interface PlatformRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path INSIDE the service, e.g. "/capacity" — never "/api/health/capacity". */
  path: string;
  query?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
  identity?: Identity;
  trace: TraceContext;
}

export interface PlatformResponse {
  status: number;
  body: unknown;
}

/**
 * What the platform knows about a running service.
 *
 * Deliberately structural: `@platform/sdk` must NOT import
 * `@platform/service-kit` (the kit imports the SDK). A service runtime
 * registers itself as an endpoint, and the SDK never learns what a service is
 * made of — only how to knock on its door.
 */
export interface ServiceEndpoint {
  id: string;
  name: string;
  description: string;
  routes: ApiRouteMeta[];
  handle(request: PlatformRequest): Promise<PlatformResponse>;
}

const endpoints = new Map<string, ServiceEndpoint>();

export function registerServiceEndpoint(endpoint: ServiceEndpoint): void {
  endpoints.set(endpoint.id, endpoint);
}

export function unregisterServiceEndpoint(id: string): void {
  endpoints.delete(id);
}

export function serviceEndpoint(id: string): ServiceEndpoint | undefined {
  return endpoints.get(id);
}

export function allServiceEndpoints(): ServiceEndpoint[] {
  return [...endpoints.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function isServiceRunning(id: string): boolean {
  return endpoints.has(id);
}

export function resetServiceRegistry(): void {
  endpoints.clear();
}
