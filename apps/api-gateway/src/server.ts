import { createServer, type Server, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import { identityFromHeaders } from '@platform/auth';
import { eventBus, type EventEnvelope } from '@platform/events';
import { createLogger, newCorrelationId, newTraceId } from '@platform/observability';
import { allEventContracts, partnersOf, SERVICE_DIRECTORY } from '@platform/contracts';
import {
  baseDomain,
  domainFor,
  MINISTRY_DOMAINS,
  resolveMinistryHost,
  type Platform,
} from '@platform/runtime';
import { createIntrospection } from './introspection.ts';
import { parseRequest, sendJson, sendText } from './http.ts';
import { createStaticHandler } from './static.ts';
import { welcomePage } from './welcome.ts';

const log = createLogger({ service: 'gateway' });

const PORTAL_ROOT = fileURLToPath(new URL('../../student-portal/public', import.meta.url));
const ADMIN_ROOT = fileURLToPath(new URL('../../admin-observability/public', import.meta.url));

/**
 * THE API GATEWAY (§8).
 *
 * One address for the whole country:
 *
 *   /                      the student portal
 *   /portail               the student portal, from anywhere
 *   /admin                 platform-wide observability
 *   /api/<ministry>/...    every ministry service
 *   /__platform/...        introspection: services, relations, events, traces
 *   /__platform/stream     live event feed (Server-Sent Events)
 *
 * A student never needs to know which port a service is on, because there is
 * no other port.
 *
 * ONE SUBDOMAIN PER MINISTRY. The same server also answers on
 * `sante.tukhnanutha.com`, `finances.tukhnanutha.com`, … (see
 * packages/runtime/src/domains.ts). On such a host:
 *
 *   /            THAT ministry's welcome page, in its own colours
 *   /portail     the portal, opened on THAT ministry
 *   /me/...      shorthand for /api/<that ministry>/...
 *   /api/<any>/… unchanged — cross-ministry calls must work from everywhere,
 *                so the subdomain narrows the default, it never narrows reach.
 */
export function createGateway(platform: Platform): Server {
  const introspection = createIntrospection(platform);
  const servePortal = createStaticHandler(PORTAL_ROOT);
  const serveAdmin = createStaticHandler(ADMIN_ROOT, '/admin');
  const streamClients = new Set<ServerResponse>();

  // The gateway is the only wildcard subscriber on the bus (see EventBus).
  eventBus().subscribe({
    eventType: '*',
    subscriberService: 'gateway',
    description: 'Live event feed for the student portal.',
    handler: (envelope: EventEnvelope) => {
      const frame = `event: platform\ndata: ${JSON.stringify({
        eventId: envelope.eventId,
        eventType: envelope.eventType,
        sourceService: envelope.sourceService,
        traceId: envelope.traceId,
        timestamp: envelope.timestamp,
        subscribers: eventBus()
          .domainSubscribers(envelope.eventType)
          .map((s) => s.subscriberService),
        payload: envelope.payload,
      })}\n\n`;
      for (const client of streamClients) client.write(frame);
    },
  });

  return createServer((req, res) => {
    void (async () => {
      const started = Date.now();
      let path = '/';

      try {
        if (req.method === 'OPTIONS') {
          sendJson(res, 204, null);
          return;
        }

        const request = await parseRequest(req);
        path = request.path;

        // Which ministry does the Host header point at? null = platform root.
        const ministry = resolveMinistryHost(request.headers.host);

        // --- who am I? ---------------------------------------------------------
        // The portal asks this first: it is how a page served from
        // sante.tukhnanutha.com knows to open on Santé.
        if (path === '/__platform/context') {
          sendJson(res, 200, {
            host: request.headers.host ?? null,
            baseDomain: baseDomain(),
            ministry: ministry
              ? {
                  service: ministry.service,
                  slug: ministry.slug,
                  label: ministry.label,
                  name: SERVICE_DIRECTORY[ministry.service as keyof typeof SERVICE_DIRECTORY]?.name,
                  description:
                    SERVICE_DIRECTORY[ministry.service as keyof typeof SERVICE_DIRECTORY]?.description,
                  running: platform.runtimes.has(ministry.service),
                  // The theme: what makes this hostname look like itself.
                  accent: ministry.accent,
                  icon: ministry.icon,
                  tagline: ministry.tagline,
                  aliases: ministry.aliases.map((alias) => `${alias}.${baseDomain()}`),
                }
              : null,
            ministries: MINISTRY_DOMAINS.map((domain) => ({
              service: domain.service,
              slug: domain.slug,
              label: domain.label,
              host: `${domain.slug}.${baseDomain()}`,
              accent: domain.accent,
              icon: domain.icon,
              tagline: domain.tagline,
            })),
          });
          return;
        }

        // --- /me/* : this host's ministry, without naming it -------------------
        if (path === '/me' || path.startsWith('/me/')) {
          if (!ministry) {
            sendJson(res, 404, {
              error: 'no_ministry_host',
              message:
                '/me only exists on a ministry subdomain. This request arrived on ' +
                `"${request.headers.host ?? 'an unknown host'}", which is the platform root.`,
              whatToDo: `Use /api/<service>/… here, or open one of: ${MINISTRY_DOMAINS.slice(0, 3)
                .map((d) => `${d.slug}.${baseDomain()}`)
                .join(', ')}, …`,
            });
            return;
          }
          path = `/api/${ministry.service}${path.slice('/me'.length)}`;
        }

        // --- live event stream ------------------------------------------------
        if (path === '/__platform/stream') {
          res.writeHead(200, {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
            'access-control-allow-origin': '*',
          });
          res.write(`event: hello\ndata: ${JSON.stringify({ services: platform.ids.length })}\n\n`);
          streamClients.add(res);
          req.on('close', () => streamClients.delete(res));
          return;
        }

        // --- introspection ----------------------------------------------------
        if (path.startsWith('/__platform')) {
          sendJson(res, 200, await introspection.handle(path, request.query));
          return;
        }

        // --- ministry services ------------------------------------------------
        if (path.startsWith('/api/')) {
          const [, , serviceId, ...rest] = path.split('/');
          const runtime = platform.runtimes.get(serviceId);

          if (!runtime) {
            const known = serviceId in SERVICE_DIRECTORY;
            sendJson(res, known ? 503 : 404, {
              error: known ? 'service_not_running' : 'unknown_service',
              message: known
                ? `${SERVICE_DIRECTORY[serviceId as keyof typeof SERVICE_DIRECTORY].name} is declared but not running in this platform instance.`
                : `There is no ministry service called "${serviceId}".`,
              whatToDo: known
                ? `Start it with: pnpm dev   (or: pnpm dev:service ${serviceId})`
                : `The 24 ids are listed at /__platform/services`,
              subdomain: domainFor(serviceId) ? `${domainFor(serviceId)!.slug}.${baseDomain()}` : undefined,
              services: Object.keys(SERVICE_DIRECTORY),
            });
            return;
          }

          const servicePath = `/${rest.join('/')}`;

          if (servicePath === '/openapi.json') {
            sendJson(res, 200, runtime.openapi());
            return;
          }

          const identity = identityFromHeaders(request.headers);
          const response = await runtime.handle({
            method: request.method as 'GET',
            path: servicePath,
            query: request.query,
            body: request.body,
            headers: request.headers,
            identity,
            trace: {
              traceId: request.headers['x-trace-id'] || newTraceId(),
              correlationId: request.headers['x-correlation-id'] || newCorrelationId(),
              sourceService: 'gateway',
            },
          });

          res.setHeader('x-trace-id', (response.body as { traceId?: string })?.traceId ?? '');
          sendJson(res, response.status, response.body);
          return;
        }

        // --- apps -------------------------------------------------------------
        if (path === '/admin' || path.startsWith('/admin/')) {
          if (serveAdmin(path, res)) return;
        }

        // The front door. On a ministry hostname, `/` is that ministry's own
        // welcome page — its colours, its mark, its neighbours — and the working
        // portal is one click further at /portail. On the platform root nothing
        // moves: `/` stays the portal, because that is where you choose.
        if (ministry && (path === '/' || path === '/accueil')) {
          const entry = SERVICE_DIRECTORY[ministry.service as keyof typeof SERVICE_DIRECTORY];
          const runtime = platform.runtimes.get(ministry.service);
          sendText(
            res,
            200,
            welcomePage({
              ministry,
              name: entry.name,
              description: entry.description,
              running: Boolean(runtime),
              baseDomain: baseDomain(),
              partners: partnersOf(ministry.service),
              // Here the instance is running, so the figures can be measured
              // rather than declared. The edge Worker cannot, and says other
              // things instead — see apps/edge.
              facts: (() => {
                const partners = partnersOf(ministry.service).length;
                const routes = runtime?.definition.routes.length ?? 0;
                return [
                  {
                    value: partners,
                    label: partners > 1 ? 'ministères liés' : 'ministère lié',
                    hint: "Les ministères avec lesquels ce service échange, déclarés dans l'architecture.",
                  },
                  {
                    value: routes,
                    label: routes > 1 ? 'routes' : 'route',
                    hint: 'Les points d’entrée HTTP de ce service.',
                  },
                  {
                    value: allEventContracts().filter((c) => c.owner === ministry.service).length,
                    label: 'événements publiés',
                    hint: 'Les contrats dont ce service est le seul propriétaire.',
                  },
                  {
                    value: runtime?.definition.consumers.length ?? 0,
                    label: 'événements écoutés',
                    hint: 'Ce que ce service reçoit des autres.',
                  },
                ];
              })(),
            }),
            'text/html; charset=utf-8',
          );
          return;
        }
        if (path === '/portail' || path === '/portail/') path = '/index.html';

        if (servePortal(path, res)) return;

        sendText(
          res,
          404,
          `Not found: ${path}\n\n` +
            `Try:\n` +
            `  /                     student portal\n` +
            `  /admin                observability\n` +
            `  /api/health/health    a ministry service\n` +
            `  /__platform/services  the service registry\n` +
            `  /__platform/context   which ministry this hostname points at\n` +
            (ministry ? `  /me/health            ${ministry.label} (this hostname)\n` : ''),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // A refusal is not a crash. UnauthorizedError and ForbiddenError carry
        // their own status; answering 500 "this is a bug in the platform" for a
        // missing token sends a student hunting for a fault that is not there.
        const status = (error as { statusCode?: unknown })?.statusCode;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          sendJson(res, status, {
            error: error instanceof Error ? error.name : 'refused',
            message,
            whatToDo: 'Read the message: it says what this request is missing.',
          });
          return;
        }

        log.error(`gateway error on ${path}: ${message}`);
        sendJson(res, 500, {
          error: 'gateway_error',
          message,
          whatToDo: 'This is a bug in the platform, not in your service. Run `pnpm doctor`.',
        });
      } finally {
        if (path.startsWith('/api/')) {
          log.debug(`${req.method} ${path}`, { ms: Date.now() - started });
        }
      }
    })();
  });
}
