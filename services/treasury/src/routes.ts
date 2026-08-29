/**
 * ROUTES — Intelligent Treasury OS
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
import { COLLECTION, MODULES, PUBLISHES, CONSUMES, BudgetLineInput } from './domain.ts';
import { API_DEPENDENCIES, checkDependencies } from './adapters.ts';
import {
  createBudgetLine,
  getBudgetLine,
  getPosition,
  listBudgetLines,
} from './modules/real-time-treasury-twin.ts';
import { PostBudgetOptimiseInput, postBudgetOptimise } from './modules/ai-public-budget-optimizer.ts';

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
    path: '/budgetLines',
    summary: 'List every budget line.',
    module: 'real-time-treasury-twin',
    tags: ['real-time-treasury-twin'],
    query: PagingQuery,
    handler: listBudgetLines,
  }),

  route({
    method: 'GET',
    path: '/budgetLines/:id',
    summary: 'One budget line with its twin.',
    module: 'real-time-treasury-twin',
    tags: ['real-time-treasury-twin'],
    handler: getBudgetLine,
  }),

  route({
    method: 'POST',
    path: '/budgetLines',
    summary: 'Create a budget line.',
    module: 'real-time-treasury-twin',
    tags: ['real-time-treasury-twin'],
    body: BudgetLineInput,
    handler: createBudgetLine,
  }),

  route({
    method: 'POST',
    path: '/budget/optimise',
    summary: 'Propose a reallocation under a stated constraint, with its rationale.',
    module: 'ai-public-budget-optimizer',
    tags: ['ai-public-budget-optimizer'],
    body: PostBudgetOptimiseInput,
    handler: postBudgetOptimise,
  }),

  route({
    method: 'GET',
    path: '/position',
    summary: 'Commitment rate by ministry.',
    module: 'real-time-treasury-twin',
    tags: ['real-time-treasury-twin'],
    handler: getPosition,
  }),
];
