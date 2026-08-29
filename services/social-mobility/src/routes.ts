/**
 * ROUTES — Social Mobility OS
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
import { COLLECTION, MODULES, PUBLISHES, CONSUMES, CohortInput } from './domain.ts';
import { API_DEPENDENCIES, checkDependencies } from './adapters.ts';
import { getCohort, listCohorts } from './modules/social-digital-twin.ts';
import { PostEligibilityInput, postEligibility } from './modules/zero-form-social-services.ts';
import { getVulnerability } from './modules/social-mobility-ai.ts';

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
    path: '/cohorts',
    summary: 'List every household cohort.',
    module: 'social-digital-twin',
    tags: ['social-digital-twin'],
    query: PagingQuery,
    handler: listCohorts,
  }),

  route({
    method: 'GET',
    path: '/cohorts/:id',
    summary: 'One household cohort with its twin.',
    module: 'social-digital-twin',
    tags: ['social-digital-twin'],
    handler: getCohort,
  }),

  route({
    method: 'POST',
    path: '/eligibility',
    summary: 'Decide eligibility from signals already held, and explain the decision.',
    module: 'zero-form-social-services',
    tags: ['zero-form-social-services'],
    body: PostEligibilityInput,
    handler: postEligibility,
  }),

  route({
    method: 'GET',
    path: '/vulnerability',
    summary: 'Vulnerability by governorate.',
    module: 'social-mobility-ai',
    tags: ['social-mobility-ai'],
    handler: getVulnerability,
  }),
];
