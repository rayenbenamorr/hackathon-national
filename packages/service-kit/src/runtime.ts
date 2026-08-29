import { openServiceStore } from '@platform/data';
import { createLogger, newCorrelationId, newTraceId } from '@platform/observability';
import { eventBus } from '@platform/events';
import { audit, authorize, DEMO_CITIZEN, ForbiddenError, RateLimiter } from '@platform/auth';
import { createAiClient } from '@platform/ai';
import { createTwinRegistry } from '@platform/digital-twin';
import {
  createPlatformClient,
  registerServiceEndpoint,
  type PlatformRequest,
  type PlatformResponse,
} from '@platform/sdk';
import { eventContract, eventContractsOwnedBy, toOpenApi } from '@platform/contracts';
import { Router } from './router.ts';
import { toErrorBody, HttpError } from './errors.ts';
import type { ServiceContext, ServiceDefinition, RequestContext } from './types.ts';

export interface ServiceRuntime {
  readonly definition: ServiceDefinition;
  readonly context: ServiceContext;
  start(): Promise<void>;
  stop(): Promise<void>;
  handle(request: PlatformRequest): Promise<PlatformResponse>;
  openapi(): Record<string, unknown>;
  health(): ServiceHealth;
}

export interface ServiceHealth {
  service: string;
  name: string;
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  modules: string[];
  routes: number;
  publishes: string[];
  consumes: string[];
  storedRows: Record<string, number>;
  twins: number;
  ai: { provider: string; mock: boolean };
  synthetic: true;
}

const limiter = new RateLimiter(Number(process.env.RATE_LIMIT_PER_MINUTE ?? 1200));

export function createServiceRuntime(definition: ServiceDefinition): ServiceRuntime {
  const log = createLogger({ service: definition.id });
  const db = openServiceStore(definition.id);
  const router = new Router(definition.routes);
  const startedAt = Date.now();
  let unsubscribers: Array<() => void> = [];

  const context: ServiceContext = {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    log,
    db,
    twins: createTwinRegistry(db, definition.id),
    ai: createAiClient(definition.id),
    platform: createPlatformClient(definition.id),
    config: process.env,

    async publish(eventType, payload, options = {}) {
      // Ownership is checked here, early, with a message that names the fix —
      // rather than deep in the bus with a validation dump.
      const contract = eventContract(eventType);
      if (contract && contract.owner !== definition.id) {
        throw new HttpError(
          403,
          'event_not_owned',
          `"${definition.id}" tried to publish "${eventType}", which is owned by "${contract.owner}". ` +
            `Ask ${contract.owner} to publish it, or declare your own event in packages/contracts/src/events/${definition.id}.ts.`,
        );
      }
      if (!contract) {
        throw new HttpError(
          422,
          'event_not_declared',
          `"${eventType}" has no contract. Declare it with defineEvent() in ` +
            `packages/contracts/src/events/${definition.id}.ts, then add it to the service manifest.`,
        );
      }
      return eventBus().publish(eventType, definition.id, payload, options);
    },
  };

  async function handle(request: PlatformRequest): Promise<PlatformResponse> {
    const trace = request.trace ?? {
      traceId: newTraceId(),
      correlationId: newCorrelationId(),
      sourceService: 'gateway',
    };

    const match = router.match(request.method, request.path);
    if (!match) {
      const others = router.otherMethods(request.path);
      return {
        status: others.length ? 405 : 404,
        body: {
          error: others.length ? 'method_not_allowed' : 'route_not_found',
          message: others.length
            ? `${request.path} exists on ${definition.id} but only for: ${others.join(', ')}.`
            : `${definition.name} has no ${request.method} ${request.path}.`,
          service: definition.id,
          traceId: trace.traceId,
          availableRoutes: router.list().map((r) => `${r.method} ${r.path}`),
        },
      };
    }

    const identity = request.identity ?? DEMO_CITIZEN;

    try {
      const rate = limiter.check(`${definition.id}:${identity.id}`);
      if (!rate.allowed) {
        throw new HttpError(
          429,
          'rate_limited',
          `Too many calls to ${definition.name}. Try again in ${Math.ceil(rate.resetInMs / 1000)}s.`,
        );
      }

      if (!authorize(identity, match.route.auth ?? 'public')) {
        throw new ForbiddenError(
          `${request.method} ${request.path} requires "${match.route.auth}" access; the caller is "${identity.kind}".`,
        );
      }

      let query: Record<string, string> = request.query ?? {};
      if (match.route.query) {
        const parsed = match.route.query.safeParse(query);
        if (!parsed.success) {
          throw new HttpError(422, 'invalid_query', `Invalid query parameters for ${request.path}.`, {
            problems: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
          });
        }
        query = parsed.data as Record<string, string>;
      }

      let body = request.body;
      if (match.route.body) {
        const parsed = match.route.body.safeParse(body ?? {});
        if (!parsed.success) {
          throw new HttpError(
            422,
            'invalid_body',
            `Invalid request body for ${request.method} ${request.path}.`,
            {
              problems: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
            },
          );
        }
        body = parsed.data;
      }

      const requestContext: RequestContext = {
        params: match.params,
        query,
        body,
        headers: request.headers ?? {},
        identity,
        trace,
      };

      const result = await match.route.handler(context, requestContext);

      if (match.route.auth && match.route.auth !== 'public') {
        audit({
          action: `${request.method} ${request.path}`,
          actor: identity.id,
          actorKind: identity.kind,
          service: definition.id,
          traceId: trace.traceId,
        });
      }

      return { status: 200, body: result ?? { ok: true } };
    } catch (error) {
      const { status, body } = toErrorBody(error, definition.id, trace.traceId);
      if (status >= 500) log.error(body.message, { traceId: trace.traceId, path: request.path });
      else log.warn(body.message, { traceId: trace.traceId, path: request.path });
      return { status, body };
    }
  }

  return {
    definition,
    context,

    async start() {
      unsubscribers = definition.consumers.map((consumer) =>
        eventBus().subscribe({
          eventType: consumer.event,
          subscriberService: definition.id,
          description: consumer.reason,
          handler: (envelope) => consumer.handler(context, envelope),
        }),
      );

      if (db.isEmpty() && definition.seed) {
        await definition.seed(context);
        db.flush();
        log.info(`seeded synthetic data (${Object.values(db.stats()).reduce((a, b) => a + b, 0)} rows)`);
      }

      registerServiceEndpoint({
        id: definition.id,
        name: definition.name,
        description: definition.description,
        routes: definition.routes.map(({ handler: _h, ...meta }) => meta),
        handle,
      });

      await definition.onStart?.(context);
    },

    async stop() {
      for (const off of unsubscribers) off();
      unsubscribers = [];
      await definition.onStop?.(context);
      db.flush();
    },

    handle,

    openapi() {
      return toOpenApi({
        id: definition.id,
        name: definition.name,
        description: definition.description,
        routes: definition.routes.map(({ handler: _h, ...meta }) => meta),
      });
    },

    health() {
      return {
        service: definition.id,
        name: definition.name,
        status: 'ok',
        uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
        modules: definition.modules.map((m) => m.id),
        routes: definition.routes.length,
        // Read from the contract registry, so health can never claim an event
        // this service does not actually own.
        publishes: eventContractsOwnedBy(definition.id).map((c) => c.type),
        consumes: definition.consumers.map((c) => c.event),
        storedRows: db.stats(),
        twins: context.twins.count(),
        ai: { provider: context.ai.provider, mock: context.ai.mock },
        synthetic: true,
      };
    },
  };
}
