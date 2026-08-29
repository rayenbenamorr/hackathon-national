import { z } from 'zod';
import { zodToJsonSchema } from './registry.ts';

/**
 * API contracts (§11).
 *
 * The route definitions live next to their handlers in each service — a
 * contract you have to keep in sync by hand is a contract that rots. This
 * module reads that metadata STRUCTURALLY (no import of @platform/service-kit,
 * which would be a cycle) and turns it into OpenAPI 3.1.
 */
export interface ApiRouteMeta {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  description?: string;
  tags?: string[];
  auth?: 'public' | 'citizen' | 'agent' | 'service';
  query?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
  response?: z.ZodTypeAny;
  deprecated?: boolean;
}

export interface ApiServiceMeta {
  id: string;
  name: string;
  description: string;
  routes: ApiRouteMeta[];
}

const PARAM = /:([A-Za-z0-9_]+)/g;

function openApiPath(path: string): string {
  return path.replace(PARAM, '{$1}');
}

function pathParams(path: string): Array<Record<string, unknown>> {
  return [...path.matchAll(PARAM)].map((m) => ({
    name: m[1],
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }));
}

function queryParams(schema?: z.ZodTypeAny): Array<Record<string, unknown>> {
  if (!schema) return [];
  const json = zodToJsonSchema(schema) as { properties?: Record<string, unknown>; required?: string[] };
  if (!json.properties) return [];
  return Object.entries(json.properties).map(([name, sub]) => ({
    name,
    in: 'query',
    required: json.required?.includes(name) ?? false,
    schema: sub,
  }));
}

/** OpenAPI 3.1 document for one ministry service. */
export function toOpenApi(service: ApiServiceMeta, baseUrl = `/api/${service.id}`): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const route of service.routes) {
    const key = openApiPath(route.path) || '/';
    paths[key] ??= {};
    paths[key][route.method.toLowerCase()] = {
      summary: route.summary,
      description: route.description,
      tags: route.tags ?? [service.name],
      deprecated: route.deprecated ?? false,
      'x-auth': route.auth ?? 'public',
      parameters: [...pathParams(route.path), ...queryParams(route.query)],
      ...(route.body
        ? {
            requestBody: {
              required: true,
              content: { 'application/json': { schema: zodToJsonSchema(route.body) } },
            },
          }
        : {}),
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: route.response
                ? zodToJsonSchema(route.response)
                : { type: 'object', description: 'Shape not yet declared by the service.' },
            },
          },
        },
        '424': {
          description:
            'A service this endpoint depends on is not running. The body names it in plain language (§28).',
        },
        '500': { description: 'Unhandled error. The body carries a traceId you can look up in the portal.' },
      },
    };
  }

  return {
    openapi: '3.1.0',
    info: {
      title: service.name,
      version: '1.0.0',
      description: `${service.description}\n\nGenerated from the service route definitions — do not edit by hand.`,
    },
    servers: [{ url: baseUrl, description: 'Local platform gateway' }],
    paths,
  };
}

/** Shorthand builders so a service route reads as a sentence. */
export const ok = <T extends z.ZodTypeAny>(data: T) => z.object({ data, synthetic: z.boolean().optional() });
export const listOf = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: z.array(item), total: z.number().int().nonnegative() });
