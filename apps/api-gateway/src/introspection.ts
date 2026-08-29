import { eventBus } from '@platform/events';
import {
  allEventContracts,
  ARCHITECTURE_RELATIONS,
  MINIMUM_PARTNERS,
  partnersOf,
  relationsFor,
  SERVICE_DIRECTORY,
} from '@platform/contracts';
import { aiUsage, aiProvider } from '@platform/ai';
import { SENSOR_KINDS } from '@platform/iot';
import { GOVERNORATES, governoratesGeoJson } from '@platform/geo';
import { auditTrail } from '@platform/auth';
import {
  flow,
  newCorrelationId,
  newTraceId,
  recentHops,
  recentLogs,
  recentTraceIds,
  relationFailures,
  trace,
} from '@platform/observability';
import { allServiceEndpoints, isServiceRunning } from '@platform/sdk';
import type { Platform } from '@platform/runtime';

/**
 * PLATFORM INTROSPECTION — everything under `/__platform`.
 *
 * This is what makes the infrastructure teachable instead of magic. A student
 * never opens a tracing UI, installs a broker console or reads a container log:
 * the platform answers questions about itself in JSON, and the portal draws it.
 */
export interface Introspection {
  handle(path: string, query: Record<string, string>): Promise<unknown> | unknown;
  paths(): string[];
}

export function createIntrospection(platform: Platform): Introspection {
  const routes: Record<string, (query: Record<string, string>) => unknown | Promise<unknown>> = {
    '/__platform/health': () => {
      const running = platform.ids.length;
      const declared = Object.keys(SERVICE_DIRECTORY).length;
      return {
        status: running === declared ? 'ok' : 'degraded',
        running,
        declared,
        missing: Object.keys(SERVICE_DIRECTORY).filter((id) => !isServiceRunning(id)),
        bus: eventBus().stats(),
        ai: { provider: aiProvider().name, model: aiProvider().model, mock: aiProvider().mock },
        contracts: allEventContracts().length,
        relations: ARCHITECTURE_RELATIONS.length,
        synthetic: true,
      };
    },

    '/__platform/services': () =>
      Object.values(SERVICE_DIRECTORY).map((entry) => {
        const runtime = platform.runtimes.get(entry.id);
        const partners = partnersOf(entry.id);
        return {
          ...entry,
          running: Boolean(runtime),
          partners: partners.length,
          meetsConnectivityTarget: partners.length >= MINIMUM_PARTNERS,
          routes: runtime?.definition.routes.length ?? 0,
          publishes: allEventContracts()
            .filter((c) => c.owner === entry.id)
            .map((c) => c.type),
          consumes: runtime?.definition.consumers.map((c) => c.event) ?? [],
        };
      }),

    '/__platform/service': async (query) => {
      const id = query.id;
      const runtime = platform.runtimes.get(id);
      const entry = SERVICE_DIRECTORY[id as keyof typeof SERVICE_DIRECTORY];
      if (!entry) return { error: 'unknown_service', message: `No ministry service with id "${id}".` };

      const { incoming, outgoing } = relationsFor(id);
      const dependencies = runtime
        ? await runtime.handle({ method: 'GET', path: '/dependencies', trace: gatewayTrace() })
        : null;

      return {
        ...entry,
        running: Boolean(runtime),
        health: runtime
          ? (await runtime.handle({ method: 'GET', path: '/health', trace: gatewayTrace() })).body
          : null,
        partners: partnersOf(id),
        incoming,
        outgoing,
        dependencies: dependencies?.body ?? null,
        recentEvents: eventBus().recentEvents(20, id),
        recentHops: recentHops(30, id),
        failures: relationFailures(10, id),
        logs: recentLogs(40, id),
      };
    },

    '/__platform/relations': () =>
      ARCHITECTURE_RELATIONS.map((relation) => ({
        ...relation,
        sourceRunning: isServiceRunning(relation.source),
        targetRunning: isServiceRunning(relation.target),
        healthy: isServiceRunning(relation.source) && isServiceRunning(relation.target),
      })),

    '/__platform/graph': () => {
      const deliveries = eventBus().recentDeliveries(400);
      const nodes = Object.values(SERVICE_DIRECTORY).map((entry) => ({
        id: entry.id,
        name: entry.name,
        ministry: entry.ministry,
        running: isServiceRunning(entry.id),
        partners: partnersOf(entry.id).length,
      }));

      const edges = ARCHITECTURE_RELATIONS.map((relation) => {
        const seen = deliveries.filter((d) => d.from === relation.source && d.to === relation.target);
        return {
          source: relation.source,
          target: relation.target,
          kind: relation.kind,
          ref: relation.ref,
          criticality: relation.criticality,
          reason: relation.reason,
          observed: seen.length,
          broken:
            !isServiceRunning(relation.source) ||
            !isServiceRunning(relation.target) ||
            seen.some((d) => !d.ok),
        };
      });

      return { nodes, edges, minimumPartners: MINIMUM_PARTNERS };
    },

    '/__platform/events': () => {
      const subscriptions = eventBus().allSubscriptions();
      return allEventContracts().map((contract) => ({
        type: contract.type,
        version: contract.version,
        owner: contract.owner,
        summary: contract.summary,
        subscribers: subscriptions
          .filter((s) => s.eventType === contract.type)
          .map((s) => s.subscriberService),
        example: contract.example,
      }));
    },

    '/__platform/events/recent': (query) => eventBus().recentEvents(Number(query.limit ?? 50), query.service),

    '/__platform/events/deadletter': () => eventBus().deadLetterQueue(),

    '/__platform/traces': (query) =>
      recentTraceIds(Number(query.limit ?? 30)).map((traceId) => ({
        traceId,
        hops: trace(traceId).length,
        flow: flow(traceId),
      })),

    '/__platform/trace': (query) => ({ traceId: query.id, hops: trace(query.id), flow: flow(query.id) }),

    '/__platform/flows': (query) => recentHops(Number(query.limit ?? 120), query.service),

    '/__platform/logs': (query) => recentLogs(Number(query.limit ?? 100), query.service),

    '/__platform/failures': (query) => relationFailures(Number(query.limit ?? 50), query.service),

    '/__platform/audit': (query) => auditTrail(Number(query.limit ?? 50), query.service),

    '/__platform/ai': () => ({
      provider: aiProvider().name,
      model: aiProvider().model,
      mock: aiProvider().mock,
      note: aiProvider().mock
        ? 'Mock mode: deterministic, offline, free. Set AI_PROVIDER in .env for real models.'
        : 'A real provider is configured. Calls leave this machine and may cost money.',
      usage: aiUsage(),
    }),

    '/__platform/sensors': () => ({
      kinds: SENSOR_KINDS,
      simulate: SENSOR_KINDS.map((k) => `pnpm simulate:sensor ${k.kind}`),
      ingest: 'POST /api/digital-nervous-system/sensors/observations',
    }),

    '/__platform/geo': () => ({ governorates: GOVERNORATES, geojson: governoratesGeoJson() }),

    '/__platform/openapi': () =>
      allServiceEndpoints().map((endpoint) => ({
        id: endpoint.id,
        name: endpoint.name,
        openapi: `/api/${endpoint.id}/openapi.json`,
        routes: endpoint.routes.map((route) => `${route.method} ${route.path}`),
      })),
  };

  return {
    handle: (path, query) => {
      const handler = routes[path];
      if (!handler) {
        return {
          error: 'unknown_introspection_route',
          message: `No such platform endpoint: ${path}`,
          available: Object.keys(routes),
        };
      }
      return handler(query);
    },
    paths: () => Object.keys(routes),
  };
}

function gatewayTrace() {
  return { traceId: newTraceId(), correlationId: newCorrelationId(), sourceService: 'gateway' };
}
