import { z } from 'zod';
import {
  EventEnvelope,
  setEventValidator,
  versionOf,
  type EventEnvelope as Envelope,
} from '@platform/events';

/**
 * CONTRACT-FIRST DEVELOPMENT (§11).
 *
 * An event contract is the promise one ministry makes to the other 23. It is
 * declared once, here, and the bus refuses to deliver anything that breaks it —
 * so a consumer can never receive a payload it was not written against.
 *
 * Versioning rule, and it is the one students break most:
 *
 *   Adding an OPTIONAL field           -> same version. Safe.
 *   Removing / renaming / retyping a   -> NEW version (…​.v2). The .v1 contract
 *   field, or making one required         stays until every consumer moved.
 *
 * `pnpm architecture:check` fails if a consumer references a version nobody
 * publishes, and `tools/tests/contracts.test.ts` fails on silent drift.
 */
export interface EventContract<S extends z.ZodTypeAny = z.ZodTypeAny> {
  /** e.g. `agriculture.water-shortage.predicted.v1` */
  type: string;
  version: number;
  /** The single service allowed to publish it. Ownership is exclusive. */
  owner: string;
  summary: string;
  payload: S;
  /** Used by mocks, tests, the portal "try it" button and student examples. */
  example: z.infer<S>;
  tags?: string[];
  /** Set when this contract replaces an older version. */
  supersedes?: string;
}

const CONTRACTS = new Map<string, EventContract>();

export function defineEvent<S extends z.ZodTypeAny>(
  contract: Omit<EventContract<S>, 'version'>,
): EventContract<S> {
  const full = { ...contract, version: versionOf(contract.type) } as EventContract<S>;
  const existing = CONTRACTS.get(full.type);
  if (existing && existing.owner !== full.owner) {
    throw new Error(
      `Event "${full.type}" is already owned by "${existing.owner}"; "${full.owner}" cannot also publish it. ` +
        'Exactly one service owns an event type (§23: no duplicate ownership of authoritative entities).',
    );
  }
  CONTRACTS.set(full.type, full as EventContract);
  return full;
}

export function eventContract(type: string): EventContract | undefined {
  return CONTRACTS.get(type);
}

export function allEventContracts(): EventContract[] {
  return [...CONTRACTS.values()].sort((a, b) => a.type.localeCompare(b.type));
}

export function eventContractsOwnedBy(serviceId: string): EventContract[] {
  return allEventContracts().filter((c) => c.owner === serviceId);
}

export function eventTypes(): string[] {
  return allEventContracts().map((c) => c.type);
}

// ---------------------------------------------------------------------------
// Validation — plugged into the bus, so no service can opt out.
// ---------------------------------------------------------------------------

export function validateEvent(envelope: Envelope): { ok: true } | { ok: false; problems: string[] } {
  const shape = EventEnvelope.safeParse(envelope);
  if (!shape.success) {
    return {
      ok: false,
      problems: shape.error.issues.map((i) => `envelope.${i.path.join('.')}: ${i.message}`),
    };
  }

  const contract = CONTRACTS.get(envelope.eventType);
  if (!contract) {
    return {
      ok: false,
      problems: [
        `no contract is declared for "${envelope.eventType}". ` +
          `Declare it with defineEvent() in packages/contracts/src/events/${envelope.sourceService}.ts.`,
      ],
    };
  }

  if (contract.owner !== envelope.sourceService) {
    return {
      ok: false,
      problems: [
        `"${envelope.eventType}" is owned by "${contract.owner}"; "${envelope.sourceService}" may not publish it.`,
      ],
    };
  }

  const payload = contract.payload.safeParse(envelope.payload);
  if (!payload.success) {
    return {
      ok: false,
      problems: payload.error.issues.map((i) => `payload.${i.path.join('.') || '(root)'}: ${i.message}`),
    };
  }

  return { ok: true };
}

setEventValidator(validateEvent);

// ---------------------------------------------------------------------------
// AsyncAPI-shaped export (§11) — machine readable, no code generator needed.
// ---------------------------------------------------------------------------

export function toAsyncApi(): Record<string, unknown> {
  const channels: Record<string, unknown> = {};
  for (const contract of allEventContracts()) {
    channels[contract.type] = {
      description: contract.summary,
      subscribe: {
        operationId: contract.type.replace(/\W/g, '_'),
        tags: (contract.tags ?? []).map((name) => ({ name })),
        message: {
          name: contract.type,
          title: contract.summary,
          contentType: 'application/json',
          headers: { $ref: '#/components/schemas/EventEnvelope' },
          payload: zodToJsonSchema(contract.payload),
          examples: [{ name: 'sample', payload: contract.example }],
        },
      },
      'x-owner': contract.owner,
      'x-version': contract.version,
    };
  }

  return {
    asyncapi: '2.6.0',
    info: {
      title: 'Tunisia National Digital Ecosystem — Event Catalog',
      version: '1.0.0',
      description:
        'Every event exchanged between the 24 ministry services. Generated from packages/contracts — do not edit by hand.',
    },
    defaultContentType: 'application/json',
    channels,
    components: {
      schemas: {
        EventEnvelope: {
          type: 'object',
          required: [
            'eventId',
            'eventType',
            'version',
            'timestamp',
            'sourceService',
            'correlationId',
            'traceId',
            'payload',
            'metadata',
          ],
          properties: {
            eventId: { type: 'string' },
            eventType: { type: 'string' },
            version: { type: 'integer' },
            timestamp: { type: 'string', format: 'date-time' },
            sourceService: { type: 'string' },
            correlationId: { type: 'string' },
            traceId: { type: 'string' },
            payload: {},
            metadata: { type: 'object' },
          },
        },
      },
    },
  };
}

/**
 * Minimal zod → JSON Schema. Deliberately hand-rolled and small: it covers the
 * subset this platform uses, and it means the contracts package has no
 * dependency beyond zod itself.
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const def = schema._def as { typeName?: string; [k: string]: unknown };
  const typeName = def.typeName as string | undefined;

  switch (typeName) {
    case 'ZodString': {
      const checks = (def.checks ?? []) as Array<{ kind: string }>;
      const out: Record<string, unknown> = { type: 'string' };
      if (checks.some((c) => c.kind === 'datetime')) out.format = 'date-time';
      return out;
    }
    case 'ZodNumber':
      return { type: 'number' };
    case 'ZodBoolean':
      return { type: 'boolean' };
    case 'ZodDate':
      return { type: 'string', format: 'date-time' };
    case 'ZodLiteral':
      return { const: def.value };
    case 'ZodEnum':
      return { type: 'string', enum: def.values as string[] };
    case 'ZodNativeEnum':
      return { type: 'string' };
    case 'ZodArray':
      return { type: 'array', items: zodToJsonSchema(def.type as z.ZodTypeAny) };
    case 'ZodObject': {
      const shape = (def.shape as () => Record<string, z.ZodTypeAny>)();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = zodToJsonSchema(value);
        if (!value.isOptional()) required.push(key);
      }
      return { type: 'object', properties, ...(required.length ? { required } : {}) };
    }
    case 'ZodOptional':
    case 'ZodNullable':
    case 'ZodDefault':
      return zodToJsonSchema((def.innerType ?? def.type) as z.ZodTypeAny);
    case 'ZodUnion':
      return { anyOf: (def.options as z.ZodTypeAny[]).map(zodToJsonSchema) };
    case 'ZodRecord':
      return { type: 'object', additionalProperties: true };
    case 'ZodEffects':
      return zodToJsonSchema(def.schema as z.ZodTypeAny);
    default:
      return {};
  }
}
