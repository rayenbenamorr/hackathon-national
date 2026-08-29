/**
 * ROUTES — Industrial & Energy Intelligence Grid
 *
 * Declarations only: every handler lives in the module it belongs to. Four
 * endpoints are platform standard and every ministry has them —
 * /health, /signals, /twins and /dependencies — because a student debugging at
 * 2 a.m. should find the same four doors on all 24 services.
 */
import {
  route,
  readSignals,
  type RouteDefinition,
  type ServiceContext,
  type RequestContext,
  PagingQuery,
} from '@platform/service-kit';
import { relationFailures } from '@platform/observability';
import { COLLECTION, MODULES, PUBLISHES, CONSUMES, AssetInput } from './domain.ts';
import { API_DEPENDENCIES, checkDependencies } from './adapters.ts';
import { createAsset, getAsset, listAssets } from './modules/industrial-digital-twin-network.ts';
import { PostSymbiosisMatchInput, postSymbiosisMatch } from './modules/ai-industrial-symbiosis.ts';
import { getGridLoad } from './modules/energy-internet.ts';

const STARTED_AT = Date.now();

export const routes: RouteDefinition[] = [
  route({
    method: 'GET',
    path: '/health',
    summary: 'Is this ministry service alive, and what does it currently hold?',
    tags: ['platform'],
    handler: (ctx: ServiceContext) => ({
      service: ctx.id,
      name: ctx.name,
      status: 'ok',
      uptimeSeconds: Math.round((Date.now() - STARTED_AT) / 1000),
      modules: MODULES.map((m) => m.id),
      publishes: PUBLISHES,
      consumes: CONSUMES,
      records: ctx.db.stats(),
      twins: ctx.twins.count(),
      ai: { provider: ctx.ai.provider, model: ctx.ai.model, mock: ctx.ai.mock },
      dependencies: API_DEPENDENCIES.length,
      synthetic: true,
    }),
  }),

  route({
    method: 'GET',
    path: '/signals',
    summary: 'What the other ministries have told this one. Start here when an integration looks silent.',
    tags: ['platform'],
    handler: (ctx: ServiceContext, req: RequestContext) => ({
      items: readSignals(ctx, {
        eventType: req.query.eventType,
        from: req.query.from,
        governorate: req.query.governorate,
        limit: Number(req.query.limit ?? 40),
      }),
      consuming: CONSUMES,
      synthetic: true,
    }),
  }),

  route({
    method: 'GET',
    path: '/twins',
    summary: 'The digital twins this ministry maintains.',
    tags: ['platform'],
    handler: (ctx: ServiceContext, req: RequestContext) => ({
      items: ctx.twins.list({ governorate: req.query.governorate, limit: Number(req.query.limit ?? 50) }),
      total: ctx.twins.count(),
      synthetic: true,
    }),
  }),

  route({
    method: 'GET',
    path: '/twins/:id',
    summary: 'One twin: state, observations, relationships and history.',
    tags: ['platform'],
    handler: (ctx: ServiceContext, req: RequestContext) => {
      const twin = ctx.twins.get(req.params.id);
      return twin ? { data: twin, history: ctx.twins.history(req.params.id) } : { data: null, history: [] };
    },
  }),

  route({
    method: 'GET',
    path: '/dependencies',
    summary: 'Live status of every other ministry this one calls. Red here means a broken integration.',
    tags: ['platform'],
    handler: async (ctx: ServiceContext) => ({
      items: await checkDependencies(ctx),
      recentFailures: relationFailures(20, ctx.id),
      synthetic: true,
    }),
  }),

  route({
    method: 'GET',
    path: '/assets',
    summary: 'List every industrial asset.',
    module: 'industrial-digital-twin-network',
    tags: ['industrial-digital-twin-network'],
    query: PagingQuery,
    handler: listAssets,
  }),

  route({
    method: 'GET',
    path: '/assets/:id',
    summary: 'One industrial asset with its twin.',
    module: 'industrial-digital-twin-network',
    tags: ['industrial-digital-twin-network'],
    handler: getAsset,
  }),

  route({
    method: 'POST',
    path: '/assets',
    summary: 'Create a industrial asset.',
    module: 'industrial-digital-twin-network',
    tags: ['industrial-digital-twin-network'],
    body: AssetInput,
    handler: createAsset,
  }),

  route({
    method: 'POST',
    path: '/symbiosis/match',
    summary: 'Find a use for a waste stream in another plant.',
    module: 'ai-industrial-symbiosis',
    tags: ['ai-industrial-symbiosis'],
    body: PostSymbiosisMatchInput,
    handler: postSymbiosisMatch,
  }),

  route({
    method: 'GET',
    path: '/grid/load',
    summary: 'Load and renewable share by governorate.',
    module: 'energy-internet',
    tags: ['energy-internet'],
    handler: getGridLoad,
  }),
];
