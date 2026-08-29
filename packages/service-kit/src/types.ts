import type { z } from 'zod';
import type { ServiceStore } from '@platform/data';
import type { Logger, TraceContext } from '@platform/observability';
import type { EventEnvelope, PublishOptions } from '@platform/events';
import type { Identity, AuthRequirement } from '@platform/auth';
import type { AiClient } from '@platform/ai';
import type { TwinRegistry } from '@platform/digital-twin';
import type { PlatformClient } from '@platform/sdk';
import type { ApiRouteMeta } from '@platform/contracts';

/**
 * EVERYTHING A MINISTRY SERVICE IS GIVEN.
 *
 * A student never constructs any of this. They receive `ctx` and use it. That
 * single object is the reason a beginner can write a feature that stores data,
 * calls an AI model, updates a digital twin and notifies four other ministries
 * without knowing what a message broker is.
 */
export interface ServiceContext {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  /** Structured logging. Already tagged with this service. */
  readonly log: Logger;

  /** THIS service's database. There is no way to reach another one (§7). */
  readonly db: ServiceStore;

  /** This service's digital twins. */
  readonly twins: TwinRegistry;

  /** AI: chat, structured output, embeddings, RAG, agents. Mock by default. */
  readonly ai: AiClient;

  /** Calls to the other 23 ministries. The only legal channel. */
  readonly platform: PlatformClient;

  /** Publish one of THIS service's declared events onto the national bus. */
  publish<P>(eventType: string, payload: P, options?: PublishOptions): Promise<EventEnvelope<P>>;

  readonly config: Record<string, string | undefined>;
}

export interface RequestContext {
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
  identity: Identity;
  trace: TraceContext;
}

export type RouteHandler = (ctx: ServiceContext, request: RequestContext) => unknown | Promise<unknown>;

export interface RouteDefinition extends ApiRouteMeta {
  auth?: AuthRequirement;
  handler: RouteHandler;
  /** Which module of the service brief this endpoint belongs to. */
  module?: string;
}

export interface ConsumerDefinition<P = unknown> {
  /** The event type consumed, e.g. `environment.air-quality.updated.v1`. */
  event: string;
  /** The producing ministry — documented here so the relation is checkable. */
  from: string;
  /** Why this ministry cares. This text ends up in RELATIONS.md and the portal. */
  reason: string;
  handler: (ctx: ServiceContext, envelope: EventEnvelope<P>) => void | Promise<void>;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  purpose: string;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  /** The three modules from §18 of the brief. */
  modules: ModuleDefinition[];
  routes: RouteDefinition[];
  consumers: ConsumerDefinition[];
  /** Synthetic data, written once, only when the service database is empty. */
  seed?: (ctx: ServiceContext) => void | Promise<void>;
  /** Background work: schedulers, simulators. Must be idempotent. */
  onStart?: (ctx: ServiceContext) => void | Promise<void>;
  onStop?: (ctx: ServiceContext) => void | Promise<void>;
}

export function defineService(definition: ServiceDefinition): ServiceDefinition {
  return definition;
}

/** Typed shorthand so a route reads as a declaration, not as plumbing. */
export function route(definition: RouteDefinition): RouteDefinition {
  return definition;
}

export function consumer<S extends z.ZodTypeAny>(
  definition: Omit<ConsumerDefinition<z.infer<S>>, 'handler'> & {
    payload?: S;
    handler: ConsumerDefinition<z.infer<S>>['handler'];
  },
): ConsumerDefinition {
  const { payload: _payload, ...rest } = definition;
  return rest as ConsumerDefinition;
}
