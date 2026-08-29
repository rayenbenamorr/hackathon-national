#!/usr/bin/env node
/**
 * THE GENERATOR — `pnpm generate`
 *
 * Reads tools/spec/* and writes the platform:
 *   architecture/services.yaml, architecture/relations.yaml
 *   packages/contracts/src/events/<service>.ts + services.ts
 *   services/<service>/{docs, manifest, src, tests, examples}
 *   services/registry.ts
 *
 * TWO CLASSES OF OUTPUT, AND THE DIFFERENCE MATTERS:
 *
 *   DERIVED   (always rewritten)  manifests, RELATIONS.md, API.md, EVENTS.md,
 *                                 architecture/*.yaml, contracts/services.ts,
 *                                 services/registry.ts
 *   SEEDED    (written once)      everything under services/<id>/src, tests,
 *                                 examples, README, STUDENT_GUIDE, and the
 *                                 event contract files
 *
 * Seeded files are a STARTING POINT students own from the first minute. The
 * generator will never overwrite their work — that is what `--force` is for,
 * and `--force` is for the organisers rebuilding a fresh repository, not for a
 * team on day three.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import {
  SERVICES,
  RELATIONS,
  POLES,
  relationEdges,
  connectivity,
  allEvents,
  MINIMUM_PARTNERS,
} from './spec/index.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const FORCE = process.argv.includes('--force');
const EXAMPLE_DATE = '2026-08-28T09:00:00.000Z';

let written = 0;
let skipped = 0;

function write(relativePath, content, { derived = false } = {}) {
  const target = join(ROOT, relativePath);
  if (!derived && !FORCE && existsSync(target)) {
    skipped += 1;
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content.replace(/\r\n/g, '\n'), 'utf8');
  written += 1;
}

// ---------------------------------------------------------------------------
// Naming
// ---------------------------------------------------------------------------

const pascal = (s) =>
  String(s)
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');
const camel = (s) => {
  const p = pascal(s);
  return p[0].toLowerCase() + p.slice(1);
};
const singular = (s) =>
  s.endsWith('ies')
    ? `${s.slice(0, -3)}y`
    : s.endsWith('ses')
      ? s.slice(0, -2)
      : s.endsWith('s')
        ? s.slice(0, -1)
        : s;
const eventConst = (type) => pascal(type.replace(/\./g, '-'));
const routeFn = (method, path) => camel(`${method.toLowerCase()}-${path.replace(/[:/]/g, '-')}`);

// ---------------------------------------------------------------------------
// Field DSL
// ---------------------------------------------------------------------------

function parseField(spec) {
  let raw = spec;
  const optional = raw.endsWith('?');
  if (optional) raw = raw.slice(0, -1);
  if (raw.startsWith('enum:')) return { kind: 'enum', values: raw.slice(5).split('|'), optional };
  if (raw === 'string[]') return { kind: 'stringArray', optional };
  if (raw === 'number[]') return { kind: 'numberArray', optional };
  return { kind: raw, optional };
}

function zodExpr(name, spec) {
  const f = parseField(spec);
  let base;
  switch (f.kind) {
    case 'id':
    case 'string':
      base = 'z.string()';
      break;
    case 'text':
      base = 'z.string()';
      break;
    case 'number':
      base = 'z.number()';
      break;
    case 'int':
      base = 'z.number().int()';
      break;
    case 'unit':
      base = 'z.number().min(0).max(1)';
      break;
    case 'bool':
      base = 'z.boolean()';
      break;
    case 'date':
      base = 'z.string()';
      break;
    case 'geo':
      base = 'GeoLocation';
      break;
    case 'gov':
      base = 'z.string()';
      break;
    case 'enum':
      base = `z.enum([${f.values.map((v) => `'${v}'`).join(', ')}])`;
      break;
    case 'stringArray':
      base = 'z.array(z.string())';
      break;
    case 'numberArray':
      base = 'z.array(z.number())';
      break;
    default:
      base = 'z.unknown()';
  }
  return f.optional ? `${base}.optional()` : base;
}

const WORD_BANK = {
  specialties: ['cardiology', 'paediatrics', 'orthopaedics', 'maternity', 'emergency'],
  services: ['day-care', 'counselling', 'meals', 'transport', 'training'],
  disciplines: ['athletics', 'football', 'handball', 'swimming', 'judo'],
  keywords: ['desalination', 'photovoltaic', 'agronomy', 'sensing', 'materials'],
  topSkills: ['software', 'medicine', 'civil-engineering', 'finance', 'agronomy'],
  adjacentSkills: ['data-analysis', 'maintenance', 'project-management', 'quality-control'],
  requiredSkills: ['software', 'logistics', 'quality-control', 'agronomy'],
  requirements: ['sanitary-certificate', 'origin-proof', 'cold-chain', 'labelling'],
  constraints: ['flood-risk', 'water-availability', 'access-road', 'protected-neighbour'],
  drivers: ['drought-index', 'sensor-observations', 'seasonal-baseline', 'upstream-demand'],
  likelyCauses: ['sensor-drift', 'seasonal-shift', 'upstream-incident'],
  suspectedDrivers: ['air-quality', 'water-quality', 'seasonal-pattern'],
  contributingServices: ['environment', 'health', 'mobility-logistics'],
  impactedSectors: ['water', 'health', 'energy', 'mobility'],
  applicableTo: ['food-water', 'environment', 'infrastructure'],
  requiredResources: ['water-tanker', 'ambulance', 'generator', 'shelter'],
  recommendedResources: ['ambulance', 'fire-truck', 'medical-team'],
  originMix: ['domestic', 'europe', 'maghreb', 'diaspora'],
  sites: ['site-a', 'site-b', 'site-c'],
  citedTexts: ['text-2019-04', 'text-2021-17'],
  sources: ['archive-ms-114', 'catalogue-1987'],
  neighbours: ['node-2', 'node-7'],
};

function wordsFor(name) {
  return WORD_BANK[name] ?? ['alpha', 'beta', 'gamma', 'delta'];
}

/** A literal that satisfies the schema — used for contract examples. */
function exampleLiteral(name, spec) {
  const f = parseField(spec);
  switch (f.kind) {
    case 'id':
    case 'string':
      return name.endsWith('Id') ? `'${camel(singular(name.replace(/Id$/, '')))}_0001'` : `'${name}-sample'`;
    case 'text':
      return `'Synthetic example value for ${name}.'`;
    case 'number':
      return '42.5';
    case 'int':
      return '12';
    case 'unit':
      return '0.42';
    case 'bool':
      return 'true';
    case 'date':
      return `'${EXAMPLE_DATE}'`;
    case 'geo':
      return `{ lat: 36.8065, lon: 10.1815, governorate: 'TN-11' }`;
    case 'gov':
      return `'TN-11'`;
    case 'enum':
      return `'${f.values[0]}'`;
    case 'stringArray':
      return `[${wordsFor(name)
        .slice(0, 2)
        .map((w) => `'${w}'`)
        .join(', ')}]`;
    case 'numberArray':
      return '[1, 2, 3]';
    default:
      return 'null';
  }
}

/** A runtime expression for synthetic seeding. `rng`, `gov`, `index` are in scope. */
function seedExpr(name, spec, entityLabel) {
  const f = parseField(spec);
  if (name === 'governorate' && f.kind === 'gov') return 'gov.code';
  if (name === 'location' && f.kind === 'geo') return 'syntheticPointIn(gov.code, rng)';
  if (name === 'label') return `\`${entityLabel} \${index + 1} — \${gov.name}\``;

  switch (f.kind) {
    case 'id':
    case 'string':
      if (/country/i.test(name))
        return `pick(['France', 'Italy', 'Germany', 'Canada', 'Qatar'] as const, rng)`;
      if (/city|post/i.test(name))
        return `pick(['Paris', 'Milan', 'Berlin', 'Montreal', 'Doha'] as const, rng)`;
      if (/ministry/i.test(name))
        return `pick(['Finance', 'Health', 'Transport', 'Environment', 'Education'] as const, rng)`;
      if (/institution|operator|programme|program/i.test(name))
        return `\`${'${'}gov.name} ${name} \${index + 1}\``;
      if (/court/i.test(name)) return `\`Court of \${gov.name}\``;
      if (/hsCode|code/i.test(name)) return `String(1000 + Math.round(rng() * 8999))`;
      if (/period/i.test(name))
        return `pick(['punic', 'roman', 'aghlabid', 'hafsid', 'ottoman', 'modern'] as const, rng)`;
      if (/sensorKind|kind/i.test(name))
        return `pick(['air-quality', 'water-level', 'traffic-flow'] as const, rng)`;
      if (/unit/i.test(name)) return `pick(['mm', 'm3', '%', 'MW'] as const, rng)`;
      if (/reference/i.test(name))
        return `\`REF-\${gov.code.slice(3)}-\${String(index + 1).padStart(4, '0')}\``;
      if (/use|stream|material|species|syndrome|dependency|cause|discipline|domain|sector|skill/i.test(name))
        return `pick(${JSON.stringify(wordsFor(name))} as const, rng)`;
      return `\`${name}-\${index + 1}\``;
    case 'text':
      return `'Synthetic record generated for the hackathon platform. Not real data.'`;
    case 'number':
      if (/pct|percent|share/i.test(name)) return 'Number((rng() * 100).toFixed(1))';
      if (/tnd|budget|cost|revenue|amount/i.test(name)) return 'Math.round(rng() * 900000)';
      if (/hectare|area/i.test(name)) return 'Number((rng() * 120 + 1).toFixed(2))';
      if (/mw|load/i.test(name)) return 'Number((rng() * 400).toFixed(1))';
      if (/kwh/i.test(name)) return 'Math.round(rng() * 40000)';
      if (/temperature/i.test(name)) return 'Number((14 + rng() * 24).toFixed(1))';
      if (/turbidity|no2|pm25|noise/i.test(name)) return 'Number((rng() * 80).toFixed(1))';
      if (/micro|strain/i.test(name)) return 'Math.round(rng() * 1200)';
      if (/m3/i.test(name)) return 'Math.round(rng() * 5000)';
      if (/tonne/i.test(name)) return 'Number((rng() * 900).toFixed(1))';
      return 'Number((rng() * 100).toFixed(2))';
    case 'int':
      if (/year|century/i.test(name)) return 'Math.round(1950 + rng() * 70)';
      if (/beds|capacity|pupils|visitors|users|people|size|population/i.test(name))
        return 'Math.round(rng() * 800) + 20';
      if (/trl/i.test(name)) return 'Math.max(1, Math.round(rng() * 9))';
      if (/days|minutes|hours|months/i.test(name)) return 'Math.max(1, Math.round(rng() * 30))';
      return 'Math.round(rng() * 100)';
    case 'unit':
      return 'Number(rng().toFixed(3))';
    case 'bool':
      return 'rng() > 0.45';
    case 'date':
      return 'new Date(Date.now() - Math.round(rng() * 90) * 86400000).toISOString()';
    case 'geo':
      return 'syntheticPointIn(gov.code, rng)';
    case 'gov':
      return 'gov.code';
    case 'enum':
      return `pick([${f.values.map((v) => `'${v}'`).join(', ')}] as const, rng)`;
    case 'stringArray':
      return `pickMany(${JSON.stringify(wordsFor(name))} as const, rng, 2)`;
    case 'numberArray':
      return '[Number(rng().toFixed(2)), Number(rng().toFixed(2))]';
    default:
      return 'null';
  }
}

// ---------------------------------------------------------------------------
// Payload mapping — how a publishing route fills its event contract
// ---------------------------------------------------------------------------

/**
 * Maps each field of an event payload to an expression, given what the route
 * has in scope. This is the piece that makes "publish an event" a single line
 * in a route instead of a lookup exercise for a beginner.
 */
function payloadMapping(eventFields, options) {
  const { rowVar, entityFields = {}, collection, kind } = options;
  const idFields = Object.keys(eventFields).filter((f) => /Id$/.test(f));
  const singularName = collection ? singular(collection) : '';
  const lines = [];

  for (const [name, spec] of Object.entries(eventFields)) {
    const f = parseField(spec);
    let expr;

    if (/^(requestedBy|targetService|ownerService|service|sourceService)$/.test(name)) {
      expr = 'ctx.id';
    } else if (/Id$/.test(name) && rowVar && (name === `${singularName}Id` || idFields.length === 1)) {
      expr = `${rowVar}.id`;
    } else if (/Id$/.test(name)) {
      expr = `newId('${camel(name.replace(/Id$/, ''))}')`;
    } else if (['title', 'name', 'label'].includes(name) && rowVar) {
      expr = `${rowVar}.label`;
    } else if (rowVar && entityFields[name]) {
      expr = `${rowVar}.${name}`;
    } else if (kind === 'group' && name === 'governorate') {
      expr = 'key';
    } else if (kind === 'group' && entityFields[name]) {
      const gf = parseField(entityFields[name]);
      if (gf.kind === 'number' || gf.kind === 'unit') expr = `avg(rows, '${name}')`;
      else if (gf.kind === 'int') expr = `Math.round(avg(rows, '${name}'))`;
      else if (gf.kind === 'geo') expr = `rows[0]?.location`;
      else if (gf.kind === 'bool') expr = `avg(rows, '${name}') > 0.5`;
      else expr = `mode(rows, '${name}')`;
    } else {
      switch (f.kind) {
        case 'date':
          expr = 'nowIso()';
          break;
        case 'gov':
          expr = kind === 'group' ? 'key' : rowVar ? `${rowVar}.governorate` : `'TN-11'`;
          break;
        case 'geo':
          expr = rowVar ? `${rowVar}.location` : 'undefined';
          break;
        case 'unit':
          expr = kind === 'group' ? 'Number(Math.min(1, rows.length / 20).toFixed(3))' : '0.5';
          break;
        case 'int':
          expr = kind === 'group' ? 'rows.length' : '1';
          break;
        case 'number':
          expr = kind === 'group' ? 'Number(rows.length.toFixed(1))' : '0';
          break;
        case 'bool':
          expr = 'true';
          break;
        case 'enum':
          expr = `'${f.values[0]}'`;
          break;
        case 'stringArray':
          expr = 'signalSources(ctx)';
          break;
        case 'numberArray':
          expr = '[]';
          break;
        case 'text':
          expr =
            kind === 'group' ? '`${rows.length} records observed in ${key}.`' : '`Recorded by ${ctx.name}.`';
          break;
        default:
          expr = rowVar ? `${rowVar}.label` : 'key';
      }
    }

    lines.push(`        ${name}: ${expr},`);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// 1. Event contracts
// ---------------------------------------------------------------------------

function generateEventContracts(service) {
  const needsGeo = service.events.some((e) =>
    Object.values(e.fields).some((f) => parseField(f).kind === 'geo'),
  );

  const body = service.events
    .map((event) => {
      const fields = Object.entries(event.fields)
        .map(([name, spec]) => `    ${name}: ${zodExpr(name, spec)},`)
        .join('\n');
      const example = Object.entries(event.fields)
        .map(([name, spec]) => `    ${name}: ${exampleLiteral(name, spec)},`)
        .join('\n');
      return `
/**
 * ${event.summary}
 *
 * Owner: \`${service.id}\` (${service.name}) — no other service may publish this.
 */
export const ${eventConst(event.type)} = defineEvent({
  type: '${event.type}',
  owner: '${service.id}',
  summary: ${JSON.stringify(event.summary)},
  tags: ['${service.id}'],
  payload: z.object({
${fields}
  }),
  example: {
${example}
  },
});`;
    })
    .join('\n');

  return `/**
 * EVENT CONTRACTS — ${service.name}
 *
 * Adding an event: declare it here with defineEvent(), then add it to
 * tools/spec/services.part*.mjs and run \`pnpm generate\` so the manifest,
 * the docs and the architecture registry agree with the code.
 *
 * Changing an event: adding an OPTIONAL field is safe. Anything else needs a
 * new version (\`.v2\`) with the \`.v1\` contract kept until every consumer moved.
 */
import { z } from 'zod';${needsGeo ? `\nimport { GeoLocation } from '@platform/refs';` : ''}
import { defineEvent } from '../registry.ts';
${body}
`;
}

// ---------------------------------------------------------------------------
// 2. Service source
// ---------------------------------------------------------------------------

function generateDomain(service) {
  const entity = service.entity;
  const Name = pascal(singular(entity.collection));
  const fields = { label: 'string', ...entity.fields };
  const needsGeo = Object.values(fields).some((f) => parseField(f).kind === 'geo');

  const consumed = (RELATIONS[service.id] ?? []).filter((r) => r.kind === 'event').map((r) => r.ref);

  return `/**
 * DOMAIN MODEL — ${service.name}
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';${needsGeo ? `\nimport { GeoLocation } from '@platform/refs';` : ''}

export const COLLECTION = '${entity.collection}';
export const ENTITY_LABEL = ${JSON.stringify(entity.label)};

export const ${Name} = z.object({
  id: z.string(),
${Object.entries(fields)
  .map(([name, spec]) => `  ${name}: ${zodExpr(name, spec)},`)
  .join('\n')}
  synthetic: z.boolean().default(true),
});
export type ${Name} = z.infer<typeof ${Name}>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const ${Name}Input = ${Name}.omit({ id: true, synthetic: true }).partial();
export type ${Name}Input = z.infer<typeof ${Name}Input>;

export const MODULES = ${JSON.stringify(service.modules, null, 2).replace(/"([a-zA-Z]+)":/g, '$1:')} as const;

export const PUBLISHES = [
${service.events.map((e) => `  '${e.type}',`).join('\n')}
] as const;

export const CONSUMES = [
${[...new Set(consumed)].map((e) => `  '${e}',`).join('\n')}
] as const;
`;
}

function generateSeed(service) {
  const entity = service.entity;
  const Name = pascal(singular(entity.collection));
  const fields = { label: 'string', ...entity.fields };
  const usesGeo = Object.values(fields).some((f) => parseField(f).kind === 'geo');

  if (service.id === 'digital-nervous-system') {
    return `/**
 * SYNTHETIC DATA — ${service.name}
 *
 * The nervous system does not invent sensors: it registers the ones the
 * simulator declares, so that the registry and what actually emits observations
 * can never disagree. Every row is labelled \`synthetic: true\`.
 */
import { SensorSimulator } from '@platform/iot';
import type { ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Sensor } from './domain.ts';

export function seed(ctx: ServiceContext): void {
  const simulator = new SensorSimulator({ perKind: 2, seed: 'national-fabric-v1' });
  const sensors = ctx.db.collection<Sensor>(COLLECTION);

  for (const sensor of simulator.sensors) {
    sensors.upsert({
      id: sensor.id,
      label: sensor.label,
      sensorKind: sensor.sensorKind,
      governorate: sensor.location.governorate ?? 'TN-11',
      location: sensor.location,
      unit: sensor.unit,
      mode: 'simulated',
      lastValue: 0,
      healthy: true,
      synthetic: true,
    });
  }

  ctx.twins.upsert({
    id: 'twin_national_fabric',
    type: 'network',
    label: 'National sensor fabric',
    state: { sensors: simulator.sensors.length, status: 'nominal' },
  });

  ctx.log.info(\`registered \${simulator.sensors.length} synthetic sensors\`);
}

/** The same twin helpers every other ministry has, so routes read identically. */
export function twinIdFor(row: Sensor): string {
  return \`twin_\${row.id}\`;
}

export function upsertTwin(ctx: ServiceContext, row: Sensor): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'network',
    label: row.label,
    location: row.location,
    state: { sensorKind: row.sensorKind, lastValue: row.lastValue, healthy: row.healthy, status: 'nominal' },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}
`;
  }

  const twin = entity.twin;
  const twinStateFields = twin?.stateFields ?? [];
  const twinState = twinStateFields.map((f) => `      ${f}: row.${f},`).join('\n');
  // Only add the default marker when the entity does not already carry a
  // `status` of its own — otherwise the object literal has two of them.
  const twinStatusLine = twinStateFields.includes('status') ? '' : `\n      status: 'nominal',`;

  return `/**
 * SYNTHETIC DATA — ${service.name}
 *
 * §25: no real citizen data, ever. Every row carries \`synthetic: true\`, and the
 * generator is SEEDED from the service id — so the same record sits at the same
 * coordinates on every laptop in the room, and two teams can compare screenshots.
 */
import { pickGovernorate, seededRandom${usesGeo ? ', syntheticPointIn' : ''} } from '@platform/geo';
import { pick, pickMany, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type ${Name} } from './domain.ts';

/** One plausible record. Reused by the seeder AND by POST ${'/'}${entity.collection}. */
export function make${Name}(rng: () => number, index: number): Omit<${Name}, 'id'> {
  const gov = pickGovernorate(rng);
  return {
${Object.entries(fields)
  .map(([name, spec]) => `    ${name}: ${seedExpr(name, spec, entity.label)},`)
  .join('\n')}
    synthetic: true,
  };
}

export function twinIdFor(row: ${Name}): string {
  return \`twin_\${row.id}\`;
}

export function upsertTwin(ctx: ServiceContext, row: ${Name}): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: '${twin?.type ?? 'asset'}',
    label: row.label,${usesGeo ? '\n    location: row.location,' : ''}
    state: {
${twinState}${twinStatusLine}
    },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}

export function seed(ctx: ServiceContext): void {
  const rng = seededRandom('${service.id}:${entity.collection}:v1');
  const rows = ctx.db
    .collection<${Name}>(COLLECTION)
    .insertMany(Array.from({ length: ${entity.seed} }, (_, index) => make${Name}(rng, index)));

  for (const row of rows) upsertTwin(ctx, row);
  ctx.log.info(\`seeded \${rows.length} synthetic ${entity.collection}\`);
}
`;
}

// --- route handlers, grouped by module -------------------------------------

function handlerFor(service, api) {
  const entity = service.entity;
  const Name = pascal(singular(entity.collection));
  const collection = entity.collection;
  const event = api.publishes ? service.events.find((e) => e.type === api.publishes) : null;

  switch (api.archetype) {
    case 'list': {
      // Not every ministry keys its records by governorate (a consular post has
      // a country, a product has an origin), so the filter binds to whichever
      // field actually carries one.
      const govField =
        'governorate' in entity.fields
          ? 'governorate'
          : Object.entries(entity.fields).find(([, spec]) => parseField(spec).kind === 'gov')?.[0];

      return {
        name: `list${pascal(collection)}`,
        code: `/** ${api.summary ?? `List every ${entity.label.toLowerCase()} this ministry owns.`} */
export function list${pascal(collection)}(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<${Name}>(COLLECTION);
  const items = rows.list({
${
  govField
    ? `    match: (row) => !governorate || row.${govField} === governorate,`
    : `    // This ministry does not key its records by governorate, so ?governorate= is ignored here.`
}
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}`,
      };
    }

    case 'get':
      return {
        name: `get${Name}`,
        code: `/** ${api.summary ?? `One ${entity.label.toLowerCase()}, with its digital twin.`} */
export function get${Name}(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<${Name}>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError(${JSON.stringify(entity.label)}, req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}`,
      };

    case 'create':
      return {
        name: `create${Name}`,
        code: `/** ${api.summary ?? `Create a ${entity.label.toLowerCase()}. Any field you omit is filled with a plausible synthetic value.`} */
export async function create${Name}(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<${Name}>(COLLECTION);
  const rng = seededRandom(\`${service.id}:create:\${rows.count()}:\${Date.now()}\`);
  const draft = { ...make${Name}(rng, rows.count()), ...(req.body as Partial<${Name}>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);
${
  event
    ? `
  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish('${event.type}', {
${payloadMapping(event.fields, { rowVar: 'created', entityFields: { label: 'string', ...entity.fields }, collection, kind: 'row' })}
  }, { traceId: req.trace.traceId, correlationId: req.trace.correlationId });
`
    : ''
}
  return { data: created, synthetic: true };
}`,
      };

    case 'ai': {
      const fnName = routeFn(api.method, api.path);
      const outputFields = event ? event.fields : api.output;
      const inputFields = api.input ?? {};
      const outName = `${pascal(fnName)}Output`;
      const inName = `${pascal(fnName)}Input`;
      return {
        name: fnName,
        schemas: `export const ${inName} = z.object({
${Object.entries(inputFields)
  .map(([n, s]) => `  ${n}: ${zodExpr(n, s)},`)
  .join('\n')}
});

/** ${event ? `Identical to the payload of \`${event.type}\` — the result IS the event.` : 'The shape the model must return. Mock mode satisfies it offline.'} */
export const ${outName} = z.object({
${Object.entries(outputFields)
  .map(([n, s]) => `  ${n}: ${zodExpr(n, s)},`)
  .join('\n')}
});`,
        code: `/**
 * ${api.summary}
 *
 * Works with NO API KEY: \`ctx.ai.structured\` returns a value that satisfies
 * ${outName} either way. Set AI_PROVIDER in .env to use a real model.
 */
export async function ${fnName}(ctx: ServiceContext, req: RequestContext) {
  const input = req.body as z.infer<typeof ${inName}>;
  const rows = ctx.db.collection<${Name}>(COLLECTION).list({ limit: 12 });
  const context = readSignals(ctx, { limit: 8 })
    .map((signal) => \`- \${signal.from} sent \${signal.eventType}\`)
    .join('\\n');

  const prompt = [
    \`You are the ${api.module} module of \${ctx.name}.\`,
    ${JSON.stringify(api.summary)},
    '',
    \`Request: \${JSON.stringify(input)}\`,
    '',
    \`Own records (\${rows.length} of ${entity.label.toLowerCase()}):\`,
    JSON.stringify(rows.slice(0, 6)),
    '',
    'Recent signals from other ministries:',
    context || '(none yet — the other services may not have published)',
  ].join('\\n');

  // \`hints\` carries the caller's own values through, so a mocked answer about
  // Kairouan is about Kairouan and not about a random governorate.
  const result = await ctx.ai.structured(${outName}, prompt, {
    traceId: req.trace.traceId,
    hints: input as Record<string, unknown>,
  });

  ctx.db.collection<{ id: string; route: string; input: unknown; output: unknown; at: string }>('aiResults').insert({
    route: '${api.method} ${api.path}',
    input,
    output: result,
    at: nowIso(),
  });
${
  event
    ? `
  await ctx.publish('${event.type}', result, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });
`
    : ''
}
  return { data: result, mock: ctx.ai.mock, model: ctx.ai.model, synthetic: true };
}`,
      };
    }

    case 'analytics': {
      const fnName = routeFn(api.method, api.path);
      const numericFields = Object.entries(entity.fields)
        .filter(([, s]) => ['number', 'int', 'unit'].includes(parseField(s).kind))
        .map(([n]) => n);
      return {
        name: fnName,
        code: `/** ${api.summary} */
export async function ${fnName}(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<${Name}>(COLLECTION).list({ limit: 1000 });
  const groups = groupRows(rows as unknown as Array<Record<string, unknown>>, '${api.groupBy}');

  const items = [...groups.entries()].map(([key, groupRows_]) => ({
    ${api.groupBy}: key,
    count: groupRows_.length,
${numericFields.map((f) => `    ${f}: avg(groupRows_, '${f}'),`).join('\n')}
  }));
  items.sort((a, b) => b.count - a.count);
${
  event
    ? `
  // Publishing the top groups keeps the bus informative without flooding it.
  for (const [key, rowsRaw] of [...groups.entries()].slice(0, 5)) {
    const rows = rowsRaw as unknown as ${Name}[];
    await ctx.publish('${event.type}', {
${payloadMapping(event.fields, { entityFields: entity.fields, collection, kind: 'group' })}
    }, { traceId: req.trace.traceId, correlationId: req.trace.correlationId });
  }
`
    : ''
}
  return { groupedBy: '${api.groupBy}', items, total: rows.length, synthetic: true };
}`,
      };
    }

    case 'nearest':
      return {
        name: 'nearestResource',
        code: `/**
 * ${api.summary}
 *
 * The single most-called cross-ministry endpoint on the platform. Health,
 * Emergency and Resilience all reach for it, none of them owns a vehicle.
 */
export function nearestResource(ctx: ServiceContext, req: RequestContext) {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new BadRequestError('Give me a point: /resources/nearest?lat=36.8&lon=10.18&resourceType=ambulance');
  }

  const wanted = req.query.resourceType;
  const candidates = ctx.db.collection<Resource>(COLLECTION).list({
    match: (row) => row.status === 'available' && (!wanted || row.resourceType === wanted),
    limit: 1000,
  });

  const found = nearest(
    { lat, lon },
    candidates,
    (row) => row.location,
    { limit: Number(req.query.limit ?? 3), maxKm: Number(req.query.maxKm ?? 400) },
  );

  return {
    from: { lat, lon, governorate: resolveGovernorate({ lat, lon }).code },
    items: found.map((hit) => ({ ...hit.item, distanceKm: hit.distanceKm })),
    total: found.length,
    synthetic: true,
  };
}`,
      };

    case 'dispatch':
      return {
        name: 'dispatchResource',
        code: `/**
 * ${api.summary}
 *
 * Called by Emergency, Health and Resilience. It reserves the resource in this
 * ministry's own database and announces the assignment — the requesting
 * ministry never writes here, it asks.
 */
export async function dispatchResource(ctx: ServiceContext, req: RequestContext) {
  const body = req.body as { lat?: number; lon?: number; resourceType?: string; requestedBy?: string; reason?: string };
  if (!Number.isFinite(Number(body.lat)) || !Number.isFinite(Number(body.lon))) {
    throw new BadRequestError('POST /dispatch needs { lat, lon, resourceType?, requestedBy?, reason? }.');
  }

  const destination = { lat: Number(body.lat), lon: Number(body.lon) };
  const resources = ctx.db.collection<Resource>(COLLECTION);
  const available = resources.list({
    match: (row) => row.status === 'available' && (!body.resourceType || row.resourceType === body.resourceType),
    limit: 1000,
  });

  const [best] = nearest(destination, available, (row) => row.location, { limit: 1 });
  if (!best) {
    throw new ConflictError(
      \`No available \${body.resourceType ?? 'resource'} anywhere in the fleet. \` +
        'This is a real answer, not a failure: the caller should widen the type or escalate.',
      { requested: body.resourceType, availableTotal: available.length },
    );
  }

  const engaged = resources.update(best.item.id, { status: 'engaged', etaMinutes: Math.round(best.distanceKm * 1.6) })!;
  upsertTwin(ctx, engaged);

  const dispatch = {
    dispatchId: newId('dispatch'),
    resourceId: engaged.id,
    resourceType: engaged.resourceType,
    requestedBy: body.requestedBy ?? req.identity.service ?? 'unknown',
    destination: { ...destination, governorate: resolveGovernorate(destination).code },
    etaMinutes: engaged.etaMinutes,
    dispatchedAt: nowIso(),
  };

  await ctx.publish('transport.resource.dispatched.v1', dispatch, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: dispatch, distanceKm: best.distanceKm, synthetic: true };
}`,
      };

    case 'ingest':
      return {
        name: 'ingestObservations',
        code: `/**
 * ${api.summary}
 *
 * A real ESP32 and \`pnpm simulate:sensor\` are indistinguishable here — both
 * POST the same body to the same public endpoint. Everything downstream in the
 * country receives what arrives through this one door.
 */
export async function ingestObservations(ctx: ServiceContext, req: RequestContext) {
  const body = req.body as { observations?: SensorObservation[] };
  const observations = body?.observations ?? [];
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new BadRequestError('POST /sensors/observations expects { "observations": [ … ] } with at least one reading.');
  }

  const sensors = ctx.db.collection<Sensor>(COLLECTION);
  const accepted: string[] = [];

  for (const raw of observations.slice(0, 200)) {
    const parsed = SensorObservation.safeParse(raw);
    if (!parsed.success) {
      ctx.log.warn('rejected a malformed observation', {
        problems: parsed.error.issues.slice(0, 3).map((i) => \`\${i.path.join('.')}: \${i.message}\`),
      });
      continue;
    }
    const observation = parsed.data;
    const governorate = observation.location.governorate ?? resolveGovernorate(observation.location).code;

    // Auto-registration: a device that shows up joins the fabric.
    const known = sensors.get(observation.sensorId);
    if (!known) {
      sensors.upsert({
        id: observation.sensorId,
        label: \`\${observation.sensorKind} — \${governorate}\`,
        sensorKind: observation.sensorKind,
        governorate,
        location: observation.location,
        unit: observation.unit,
        mode: observation.synthetic === false ? 'physical' : 'simulated',
        lastValue: observation.value,
        healthy: observation.quality !== 'suspect',
        synthetic: true,
      });
      await ctx.publish('dns.sensor.registered.v1', {
        sensorId: observation.sensorId,
        sensorKind: observation.sensorKind,
        governorate,
        mode: observation.synthetic === false ? 'physical' : 'simulated',
        ownerService: ctx.id,
        registeredAt: nowIso(),
      }, { traceId: req.trace.traceId });
    } else {
      sensors.update(known.id, { lastValue: observation.value, healthy: observation.quality !== 'suspect' });
    }

    await ctx.publish('iot.sensor.observation.v1', {
      observationId: observation.observationId,
      sensorId: observation.sensorId,
      sensorKind: observation.sensorKind,
      value: observation.value,
      unit: observation.unit,
      location: observation.location,
      governorate,
      quality: observation.quality,
      observedAt: observation.observedAt,
    }, { traceId: req.trace.traceId, correlationId: req.trace.correlationId });

    accepted.push(observation.observationId);
  }

  return { accepted: accepted.length, rejected: observations.length - accepted.length, synthetic: true };
}`,
      };

    case 'registry':
      return {
        name: 'listServices',
        code: `/** ${api.summary} */
export function listServices(ctx: ServiceContext, _req: RequestContext) {
  return {
    items: allServiceEndpoints().map((endpoint) => ({
      id: endpoint.id,
      name: endpoint.name,
      description: endpoint.description,
      routes: endpoint.routes.map((route) => \`\${route.method} \${route.path}\`),
    })),
    total: allServiceEndpoints().length,
    reportedBy: ctx.id,
  };
}`,
      };

    case 'catalog':
      return {
        name: 'listEventCatalog',
        code: `/** ${api.summary} */
export function listEventCatalog(_ctx: ServiceContext, _req: RequestContext) {
  const subscriptions = eventBus().allSubscriptions();
  return {
    items: allEventContracts().map((contract) => ({
      type: contract.type,
      version: contract.version,
      owner: contract.owner,
      summary: contract.summary,
      subscribers: subscriptions.filter((s) => s.eventType === contract.type).map((s) => s.subscriberService),
      example: contract.example,
    })),
    total: allEventContracts().length,
    bus: eventBus().stats(),
  };
}`,
      };

    default:
      return null;
  }
}

function generateModules(service) {
  const files = {};
  const entity = service.entity;
  const Name = pascal(singular(entity.collection));

  for (const module of service.modules) {
    const apis = service.apis.filter((a) => a.module === module.id);
    if (apis.length === 0) {
      files[module.id] = `/**
 * ${module.name}
 * ${module.purpose}
 *
 * This module has no endpoint of its own yet — it is where its logic belongs.
 * Ask Claude Code: "add a feature to the ${module.name} module of ${service.name}".
 */
import type { ServiceContext } from '@platform/service-kit';

export const MODULE = { id: '${module.id}', name: ${JSON.stringify(module.name)}, purpose: ${JSON.stringify(module.purpose)} } as const;

/** Summary of what this module can currently see. Used by GET /health. */
export function moduleStatus(ctx: ServiceContext) {
  return { module: MODULE.id, records: ctx.db.collection(${JSON.stringify(entity.collection)}).count(), twins: ctx.twins.count() };
}
`;
      continue;
    }

    const handlers = apis.map((api) => handlerFor(service, api)).filter(Boolean);
    const schemas = handlers.filter((h) => h.schemas).map((h) => h.schemas);

    const needs = handlers.map((h) => h.code).join('\n\n');
    // Imports must cover the schemas too — an AI output schema can reference
    // GeoLocation without any handler body mentioning it.
    const imports = buildModuleImports(service, apis, `${schemas.join('\n')}\n${needs}`);

    files[module.id] = `/**
 * ${module.name} — ${service.name}
 *
 * ${module.purpose}
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
${imports}

export const MODULE = { id: '${module.id}', name: ${JSON.stringify(module.name)}, purpose: ${JSON.stringify(module.purpose)} } as const;
${schemas.length ? `\n${schemas.join('\n\n')}\n` : ''}
${needs}
`;
  }

  return files;
}

function buildModuleImports(service, apis, code) {
  const entity = service.entity;
  const Name = pascal(singular(entity.collection));

  const kit = new Set(['type ServiceContext', 'type RequestContext']);
  if (/NotFoundError/.test(code)) kit.add('NotFoundError');
  if (/BadRequestError/.test(code)) kit.add('BadRequestError');
  if (/ConflictError/.test(code)) kit.add('ConflictError');
  if (/\bPaging\b/.test(code)) kit.add('type Paging');
  if (/groupRows\(/.test(code)) kit.add('groupRows');
  if (/\bavg\(/.test(code)) kit.add('avg');
  if (/\bmode\(/.test(code)) kit.add('mode');
  if (/nowIso\(/.test(code)) kit.add('nowIso');
  if (/readSignals\(/.test(code)) kit.add('readSignals');
  if (/signalSources\(/.test(code)) kit.add('signalSources');

  const geo = new Set();
  if (/seededRandom\(/.test(code)) geo.add('seededRandom');
  if (/\bnearest\(/.test(code)) geo.add('nearest');
  if (/resolveGovernorate\(/.test(code)) geo.add('resolveGovernorate');

  const seedImports = new Set();
  if (new RegExp(`make${Name}\\(`).test(code)) seedImports.add(`make${Name}`);
  if (/upsertTwin\(/.test(code)) seedImports.add('upsertTwin');
  if (/twinIdFor\(/.test(code)) seedImports.add('twinIdFor');

  const lines = [];
  if (/\bz\./.test(code) || apis.some((a) => a.archetype === 'ai')) lines.push(`import { z } from 'zod';`);
  if (/newId\(/.test(code)) lines.push(`import { newId } from '@platform/observability';`);
  if (geo.size) lines.push(`import { ${[...geo].sort().join(', ')} } from '@platform/geo';`);
  const refs = [];
  if (/\bGeoLocation\b/.test(code)) refs.push('GeoLocation');
  if (/\bSensorObservation\b/.test(code)) refs.push('SensorObservation');
  if (refs.length) lines.push(`import { ${refs.join(', ')} } from '@platform/refs';`);
  if (/allServiceEndpoints\(/.test(code)) lines.push(`import { allServiceEndpoints } from '@platform/sdk';`);
  if (/allEventContracts\(/.test(code))
    lines.push(`import { allEventContracts } from '@platform/contracts';`);
  if (/eventBus\(/.test(code)) lines.push(`import { eventBus } from '@platform/events';`);
  lines.push(`import { ${[...kit].sort().join(', ')} } from '@platform/service-kit';`);
  lines.push(`import { COLLECTION, type ${Name} } from '../domain.ts';`);
  if (seedImports.size) lines.push(`import { ${[...seedImports].sort().join(', ')} } from '../seed.ts';`);

  return lines.join('\n');
}

function generateRoutes(service) {
  const entity = service.entity;
  const Name = pascal(singular(entity.collection));
  const collection = entity.collection;

  const moduleImports = new Map();
  const routeEntries = [];

  for (const api of service.apis) {
    if (api.archetype === 'health' || api.archetype === 'signals' || api.archetype === 'twins') continue;

    const handler = handlerFor(service, api);
    if (!handler) continue;

    if (!moduleImports.has(api.module)) moduleImports.set(api.module, new Set());
    moduleImports.get(api.module).add(handler.name);
    if (handler.schemas) {
      moduleImports.get(api.module).add(`${pascal(handler.name)}Input`);
    }

    const method = api.method ?? (api.archetype === 'create' ? 'POST' : 'GET');
    const path =
      api.path ??
      (api.archetype === 'list'
        ? `/${collection}`
        : api.archetype === 'get'
          ? `/${collection}/:id`
          : `/${collection}`);
    const summary =
      api.summary ??
      (api.archetype === 'list'
        ? `List every ${entity.label.toLowerCase()}.`
        : api.archetype === 'get'
          ? `One ${entity.label.toLowerCase()} with its twin.`
          : `Create a ${entity.label.toLowerCase()}.`);

    const extras = [];
    if (api.archetype === 'list') extras.push('    query: PagingQuery,');
    if (api.archetype === 'create') extras.push(`    body: ${Name}Input,`);
    if (api.archetype === 'ai') extras.push(`    body: ${pascal(handler.name)}Input,`);

    routeEntries.push(`  route({
    method: '${method}',
    path: '${path}',
    summary: ${JSON.stringify(summary)},
    module: '${api.module}',
    tags: ['${api.module}'],
${extras.join('\n')}${extras.length ? '\n' : ''}    handler: ${handler.name},
  }),`);
  }

  const imports = [...moduleImports.entries()]
    .map(([module, names]) => `import { ${[...names].sort().join(', ')} } from './modules/${module}.ts';`)
    .join('\n');

  const startedAt = 'STARTED_AT';

  return `/**
 * ROUTES — ${service.name}
 *
 * Declarations only: every handler lives in the module it belongs to. Four
 * endpoints are platform standard and every ministry has them —
 * /health, /signals, /twins and /dependencies — because a student debugging at
 * 2 a.m. should find the same four doors on all 24 services.
 */
import { route, readSignals, type RouteDefinition, type ServiceContext, type RequestContext, PagingQuery } from '@platform/service-kit';
import { relationFailures } from '@platform/observability';
import { COLLECTION, MODULES, PUBLISHES, CONSUMES, ${Name}Input } from './domain.ts';
import { API_DEPENDENCIES, checkDependencies } from './adapters.ts';
${imports}

const ${startedAt} = Date.now();

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
      uptimeSeconds: Math.round((Date.now() - ${startedAt}) / 1000),
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

${routeEntries.join('\n\n')}
];
`;
}

function generateAdapters(service) {
  const deps = (RELATIONS[service.id] ?? []).filter((r) => r.kind === 'api');

  const functions = deps
    .map((dep) => {
      const [method, path] = dep.ref.split(' ');
      const fnName = camel(`from-${dep.source}-${path.replace(/[:/]/g, '-')}`);
      return `/**
 * ${dep.reason}
 *
 * Criticality: ${dep.criticality}. Uses \`tryCall\`, so if ${dep.source} is not
 * running you get \`{ ok: false, degraded: true }\` and a readable reason —
 * never a crash and never a connection error in a student's face (§28).
 */
export async function ${fnName}(
  ctx: ServiceContext,
  options: { query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {},
) {
  return ctx.platform.tryCall('${dep.source}', '${dep.ref}', {
    ...options,
    relation: '${service.id} -> ${dep.source} (${dep.ref})',
  });
}`;
    })
    .join('\n\n');

  return `/**
 * OUTGOING API DEPENDENCIES — ${service.name}
 *
 * Every synchronous call this ministry makes to another one, declared in
 * architecture/relations.yaml and implemented here. Nothing else in this
 * service should call \`ctx.platform\` directly: keeping the calls in one file
 * is what makes GET /dependencies able to tell a student, in one screen, which
 * integration is broken.
 */
import type { ServiceContext } from '@platform/service-kit';

export interface ApiDependency {
  service: string;
  route: string;
  criticality: 'critical' | 'normal';
  reason: string;
}

export const API_DEPENDENCIES: ApiDependency[] = [
${deps
  .map(
    (dep) =>
      `  { service: '${dep.source}', route: '${dep.ref}', criticality: '${dep.criticality}', reason: ${JSON.stringify(dep.reason)} },`,
  )
  .join('\n')}
];

export interface DependencyStatus extends ApiDependency {
  running: boolean;
  reachable: boolean;
  detail?: string;
}

/** Used by GET /dependencies and by the student portal's broken-integration panel. */
export async function checkDependencies(ctx: ServiceContext): Promise<DependencyStatus[]> {
  return Promise.all(
    API_DEPENDENCIES.map(async (dependency) => {
      const running = ctx.platform.isAvailable(dependency.service);
      if (!running) {
        return {
          ...dependency,
          running: false,
          reachable: false,
          detail: \`\${dependency.service} is not running. Start it with: pnpm dev\`,
        };
      }
      const probe = await ctx.platform.tryCall(dependency.service, 'GET /health');
      return {
        ...dependency,
        running: true,
        reachable: probe.ok,
        detail: probe.ok ? undefined : probe.reason,
      };
    }),
  );
}

${functions || '// This ministry makes no synchronous cross-service calls; everything it needs arrives as events.'}
`;
}

function generateConsumers(service) {
  const consumed = (RELATIONS[service.id] ?? []).filter((r) => r.kind === 'event');
  const usesObservations = consumed.some((c) => c.ref === 'iot.sensor.observation.v1');

  const entries = consumed
    .map((relation) => {
      const isObservation = relation.ref === 'iot.sensor.observation.v1';
      return `  {
    event: '${relation.ref}',
    from: '${relation.source}',
    reason: ${JSON.stringify(relation.reason)},
    handler: (ctx, envelope) => {
      rememberSignal(ctx, envelope);${
        isObservation
          ? `
      // Sensor readings land on the twins this ministry keeps in the same governorate.
      applyObservationToTwins(ctx, envelope);`
          : ''
      }

      // ---------------------------------------------------------------------
      // YOUR REACTION GOES HERE.
      // The signal is already stored (GET /signals) and the trace is already
      // drawn in the portal. What is missing is the decision this ministry
      // should take. Example:
      //
      //   const payload = envelope.payload as { governorate?: string };
      //   ctx.twins.setState('twin_xyz', { alert: true }, '${relation.ref}');
      //   await ctx.publish('<one of PUBLISHES>', { … });
      // ---------------------------------------------------------------------
    },
  },`;
    })
    .join('\n');

  return `/**
 * INCOMING EVENTS — ${service.name}
 *
 * ${consumed.length} relations, every one of them declared in
 * architecture/relations.yaml with a stated purpose. They are already WIRED:
 * each signal is stored the moment it arrives, so \`GET /api/${service.id}/signals\`
 * shows real traffic from other ministries before you write a line.
 *
 * What is deliberately NOT written for you is the reaction. That is the feature.
 */
import { rememberSignal${usesObservations ? ', applyObservationToTwins' : ''}, type ConsumerDefinition } from '@platform/service-kit';

export const consumers: ConsumerDefinition[] = [
${entries}
];
`;
}

function generateServiceIndex(service) {
  const simulator =
    service.id === 'digital-nervous-system'
      ? `
  async onStart(ctx) {
    // The fabric produces observations on its own, so the platform has moving
    // data the moment it starts. Turn it off with IOT_SIMULATION_AUTOSTART=false.
    if (process.env.IOT_SIMULATION_AUTOSTART === 'false') {
      ctx.log.info('sensor simulation disabled (IOT_SIMULATION_AUTOSTART=false)');
      return;
    }

    const { SensorSimulator } = await import('@platform/iot');
    const simulator = new SensorSimulator({ perKind: 2, seed: 'national-fabric-v1' });
    const intervalMs = Number(process.env.IOT_SIMULATION_INTERVAL_MS ?? 8000);

    const timer = setInterval(() => {
      void (async () => {
        // One kind per tick, round-robin: informative without flooding the bus.
        const kinds = [...new Set(simulator.sensors.map((s) => s.sensorKind))];
        const kind = kinds[tick % kinds.length];
        tick += 1;

        for (const sensor of simulator.byKind(kind)) {
          const observation = simulator.read(sensor);
          try {
            await ctx.publish('iot.sensor.observation.v1', {
              observationId: observation.observationId,
              sensorId: observation.sensorId,
              sensorKind: observation.sensorKind,
              value: observation.value,
              unit: observation.unit,
              location: observation.location,
              governorate: observation.location.governorate ?? 'TN-11',
              quality: observation.quality,
              observedAt: observation.observedAt,
            });
          } catch (error) {
            ctx.log.warn(\`simulated observation rejected: \${error instanceof Error ? error.message : error}\`);
          }
        }
      })();
    }, intervalMs);
    timer.unref?.();
    simulationTimer = timer;

    ctx.log.info(\`sensor simulation running every \${intervalMs} ms across \${simulator.sensors.length} sensors\`);
  },

  onStop() {
    if (simulationTimer) clearInterval(simulationTimer);
    simulationTimer = null;
  },
`
      : '';

  const preamble =
    service.id === 'digital-nervous-system'
      ? `
let simulationTimer: NodeJS.Timeout | null = null;
let tick = 0;
`
      : '';

  return `/**
 * ${service.name}
 * Ministry: ${service.ministry}
 *
 * ${service.summary}
 *
 * ${service.mission}
 *
 * Read SERVICE_BRIEF.md before changing anything, and RELATIONS.md before
 * changing anything that other ministries depend on.
 */
import { defineService } from '@platform/service-kit';
import { MODULES } from './domain.ts';
import { routes } from './routes.ts';
import { consumers } from './consumers.ts';
import { seed } from './seed.ts';
${preamble}
export default defineService({
  id: '${service.id}',
  name: ${JSON.stringify(service.name)},
  description: ${JSON.stringify(service.summary)},
  modules: [...MODULES],
  routes,
  consumers,
  seed,${simulator}
});
`;
}

// ---------------------------------------------------------------------------
// 3. Documentation
// ---------------------------------------------------------------------------

function manifest(service) {
  const incoming = RELATIONS[service.id] ?? [];
  const consumedBy = relationEdges().filter((e) => e.source === service.id);

  return YAML.stringify({
    id: service.id,
    name: service.name,
    ministry: service.ministry,
    description: service.summary,
    mission: service.mission,
    capabilities: service.modules.map((m) => m.purpose),
    modules: service.modules,
    owns: service.owns,
    apis: service.apis
      .map((api) => {
        const method = api.method ?? (api.archetype === 'create' ? 'POST' : 'GET');
        const path =
          api.path ??
          (api.archetype === 'list'
            ? `/${service.entity.collection}`
            : api.archetype === 'get'
              ? `/${service.entity.collection}/:id`
              : `/${service.entity.collection}`);
        return {
          method,
          path: `/api/${service.id}${path}`,
          summary: api.summary ?? `${api.archetype} ${service.entity.label}`,
          module: api.module ?? 'platform',
        };
      })
      .concat([
        {
          method: 'GET',
          path: `/api/${service.id}/signals`,
          summary: 'Signals received from other ministries.',
          module: 'platform',
        },
        {
          method: 'GET',
          path: `/api/${service.id}/twins`,
          summary: 'Digital twins maintained here.',
          module: 'platform',
        },
        {
          method: 'GET',
          path: `/api/${service.id}/dependencies`,
          summary: 'Live status of outgoing integrations.',
          module: 'platform',
        },
      ]),
    publishes: service.events.map((e) => ({ event: e.type, summary: e.summary })),
    consumes: incoming
      .filter((r) => r.kind === 'event')
      .map((r) => ({ event: r.ref, from: r.source, criticality: r.criticality, reason: r.reason })),
    depends_on: [...new Set(incoming.map((r) => r.source))].sort(),
    consumed_by: [...new Set(consumedBy.map((e) => e.target))].sort(),
    related_services: connectivity()[service.id],
    ai_capabilities: service.ai,
    iot_capabilities: service.iot,
    digital_twin_capabilities: service.twin,
    data: {
      synthetic_only: true,
      owns_collection: service.entity.collection,
      seeded_rows: service.entity.seed,
    },
  });
}

function relationsDoc(service) {
  const incoming = RELATIONS[service.id] ?? [];
  const outgoing = relationEdges().filter((e) => e.source === service.id);
  const partners = connectivity()[service.id];

  const inRows = incoming
    .map((r) => `| ${r.source} | ${r.kind} | \`${r.ref}\` | ${r.criticality} | ${r.reason} |`)
    .join('\n');
  const outRows = outgoing
    .map((e) => `| ${e.target} | ${e.kind} | \`${e.ref}\` | ${e.criticality} | ${e.reason} |`)
    .join('\n');

  return `# RELATIONS — ${service.name}

> Generated from \`tools/spec/relations.mjs\`. Do not edit by hand: change the spec
> and run \`pnpm generate\`.

**${partners.length} partner ministries** out of 23 (target: ${MINIMUM_PARTNERS}).
${partners.map((p) => `\`${p}\``).join(' · ')}

## Incoming — what this service consumes

| From | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
${inRows || '| — | — | — | — | This service consumes nothing yet. |'}

## Outgoing — who depends on this service

| To | Kind | Contract | Criticality | Why |
| --- | --- | --- | --- | --- |
${outRows || '| — | — | — | — | Nothing depends on this service yet. |'}

## Before you change anything here

Breaking one of the rows above breaks another team's build during a six-day
hackathon. The rule (root \`CLAUDE.md\`, §10):

1. adding an optional field to an event you own is safe;
2. anything else is a new version \`.v2\`, with \`.v1\` kept alive;
3. \`pnpm architecture:check\` is what tells you which of the two you just did.
`;
}

function apiDoc(service) {
  const rows = service.apis
    .map((api) => {
      const method = api.method ?? (api.archetype === 'create' ? 'POST' : 'GET');
      const path =
        api.path ??
        (api.archetype === 'list'
          ? `/${service.entity.collection}`
          : api.archetype === 'get'
            ? `/${service.entity.collection}/:id`
            : `/${service.entity.collection}`);
      return `| \`${method}\` | \`/api/${service.id}${path}\` | ${api.summary ?? api.archetype} | ${api.module ?? 'platform'} |`;
    })
    .join('\n');

  return `# API — ${service.name}

Base path: \`/api/${service.id}\` · OpenAPI: \`/api/${service.id}/openapi.json\`

| Method | Path | Summary | Module |
| --- | --- | --- | --- |
| \`GET\` | \`/api/${service.id}/health\` | Liveness, holdings, AI mode | platform |
| \`GET\` | \`/api/${service.id}/signals\` | What other ministries sent here | platform |
| \`GET\` | \`/api/${service.id}/twins\` | Digital twins maintained here | platform |
| \`GET\` | \`/api/${service.id}/twins/:id\` | One twin with history | platform |
| \`GET\` | \`/api/${service.id}/dependencies\` | Live status of outgoing integrations | platform |
${rows}

## Try it

\`\`\`bash
curl http://localhost:4000/api/${service.id}/health
curl http://localhost:4000/api/${service.id}/signals
curl "http://localhost:4000/api/${service.id}/${service.entity.collection}?limit=3"
\`\`\`
`;
}

function eventsDoc(service) {
  const published = service.events
    .map(
      (e) => `### \`${e.type}\`

${e.summary}

| Field | Type |
| --- | --- |
${Object.entries(e.fields)
  .map(([n, s]) => `| \`${n}\` | \`${s}\` |`)
  .join('\n')}

Consumed by: ${
        relationEdges()
          .filter((edge) => edge.ref === e.type)
          .map((edge) => `\`${edge.target}\``)
          .join(', ') || '_nobody yet_'
      }
`,
    )
    .join('\n');

  const consumed = (RELATIONS[service.id] ?? [])
    .filter((r) => r.kind === 'event')
    .map((r) => `| \`${r.ref}\` | ${r.source} | ${r.criticality} | ${r.reason} |`)
    .join('\n');

  return `# EVENTS — ${service.name}

Contracts live in \`packages/contracts/src/events/${service.id}.ts\`. The bus
refuses to deliver anything that does not match them.

## Published by this service

${published || '_This service publishes nothing yet._'}

## Consumed by this service

| Event | From | Criticality | Why |
| --- | --- | --- | --- |
${consumed || '| — | — | — | — |'}

Handlers: \`src/consumers.ts\`. Every one already stores the signal; add your
reaction underneath.
`;
}

function serviceBrief(service) {
  return `# SERVICE BRIEF — ${service.name}

**Ministry:** ${service.ministry}
**Service id:** \`${service.id}\`
**Base path:** \`/api/${service.id}\`

## What this ministry is for

${service.mission}

## The three modules

${service.modules.map((m, i) => `### ${i + 1}. ${m.name}\n\n${m.purpose}\n\n\`src/modules/${m.id}.ts\``).join('\n\n')}

## What it owns

Authoritative for: ${service.owns.map((o) => `\`${o}\``).join(', ')}.

Its own database namespace is \`.data/${service.id}.json\`, holding the
\`${service.entity.collection}\` collection (${service.entity.seed} synthetic records seeded on
first start) plus \`signals\`, \`twins\` and \`aiResults\`.

**No other service can read that file through code** — the store API has no way
to name another namespace (\`packages/data\`). Cross-ministry data moves through
the ${service.events.length} events it publishes and the endpoints it exposes.

## Advanced technology this service is built to carry

| Area | Available here |
| --- | --- |
| AI | ${service.ai.join(' · ') || '—'} |
| IoT | ${service.iot.join(' · ') || '—'} |
| Digital twin | ${service.twin.join(' · ') || '—'} |

## Connectivity

${connectivity()[service.id].length} partner ministries. See \`RELATIONS.md\`.
`;
}

function studentGuide(service) {
  const partners = connectivity()[service.id];
  const consumed = (RELATIONS[service.id] ?? []).filter((r) => r.kind === 'event');
  const sampleEvent = service.events[0];

  return `# STUDENT GUIDE — ${service.name}

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

\`\`\`bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
\`\`\`

Ouvrez / open **http://localhost:4000** → votre ministère : **${service.name}**.

## 2. Vérifier que ça marche / Check it works

\`\`\`bash
curl http://localhost:4000/api/${service.id}/health
curl http://localhost:4000/api/${service.id}/${service.entity.collection}
curl http://localhost:4000/api/${service.id}/signals
\`\`\`

Le troisième appel est le plus important : il montre ce que **${partners.length} autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

${service.mission}

Trois modules à faire vivre :

${service.modules.map((m, i) => `${i + 1}. **${m.name}** — ${m.purpose}`).join('\n')}

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service \`${service.id}\` (${service.name}). Lis
> \`services/${service.id}/SERVICE_BRIEF.md\` et \`RELATIONS.md\`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à \`${service.id}\`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise \`ctx.ai\` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte \`${service.id}\` à \`${partners[0]}\` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : \`docs/STUDENT_CLAUDE_PROMPTS.md\`.

## 5. Ce que vous publiez / What you publish

${service.events.map((e) => `- \`${e.type}\` — ${e.summary}`).join('\n')}

Publier un événement, depuis n'importe quelle route :

\`\`\`ts
await ctx.publish('${sampleEvent.type}', {
${Object.entries(sampleEvent.fields)
  .map(([n, s]) => `  ${n}: ${exampleLiteral(n, s)},`)
  .join('\n')}
});
\`\`\`

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

${consumed.length} événements arrivent déjà dans \`src/consumers.ts\`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

${consumed
  .slice(0, 6)
  .map((c) => `- \`${c.ref}\` (${c.source}) — ${c.reason}`)
  .join('\n')}

## 7. Quand quelque chose casse / When something breaks

\`\`\`bash
curl http://localhost:4000/api/${service.id}/dependencies   # intégrations en panne
pnpm doctor                                                 # diagnostic complet
pnpm architecture:check                                     # règles d'architecture
\`\`\`

Le portail (http://localhost:4000) montre les traces : qui a appelé quoi, dans
quel ordre, et où ça s'est arrêté.

## 8. Les règles / The rules

1. **Ne lisez jamais la base d'un autre service.** C'est structurellement
   impossible ici — passez par son API ou ses événements.
2. **Ne cassez pas un contrat** que vous publiez : ajouter un champ optionnel est
   sûr, tout le reste est une \`.v2\`.
3. **Données synthétiques uniquement.** Aucune donnée réelle de citoyen.
4. **Aucun secret dans le code.** Les clés vont dans \`.env\`, jamais dans git.
`;
}

function serviceReadme(service) {
  return `# ${service.name}

\`${service.id}\` · Ministry: ${service.ministry} · Base path: \`/api/${service.id}\`

${service.summary}

| Document | What it is for |
| --- | --- |
| [\`STUDENT_GUIDE.md\`](STUDENT_GUIDE.md) | **Start here.** How to run it and what to ask Claude Code. |
| [\`SERVICE_BRIEF.md\`](SERVICE_BRIEF.md) | The mission, the three modules, what this ministry owns. |
| [\`RELATIONS.md\`](RELATIONS.md) | Every other ministry this one is connected to, and why. |
| [\`API.md\`](API.md) | Endpoints. |
| [\`EVENTS.md\`](EVENTS.md) | Events published and consumed. |
| [\`service.manifest.yaml\`](service.manifest.yaml) | Machine-readable manifest — what Claude Code reads first. |

\`\`\`
src/
  index.ts        the service definition
  domain.ts       the shapes this ministry owns
  routes.ts       endpoint declarations
  modules/        the three modules — where the logic lives
  consumers.ts    incoming events from other ministries
  adapters.ts     outgoing calls to other ministries
  seed.ts         synthetic data
tests/            contract and relation tests
examples/         runnable request samples
\`\`\`

Everything under \`src/\` is yours to edit. \`pnpm generate\` never overwrites it.
`;
}

function generateTests(service) {
  const consumed = (RELATIONS[service.id] ?? []).filter((r) => r.kind === 'event');
  const firstEvent = service.events[0];

  return `import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { startTestPlatform, type TestPlatform } from '@platform/testing';
import { eventContract } from '@platform/contracts';
import definition from '../src/index.ts';

/**
 * Contract + relation tests for ${service.name}.
 *
 * These are the tests that keep 24 teams from breaking each other. If you change
 * an event you publish, one of them fails and names the consumers you just broke.
 */
describe('${service.id}', () => {
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await startTestPlatform();
  });

  afterAll(async () => {
    await platform.stop();
  });

  it('starts and answers /health', async () => {
    const response = await platform.get('${service.id}', '/health');
    expect(response.status).toBe(200);
    expect((response.body as { service: string }).service).toBe('${service.id}');
  });

  it('owns a contract for every event it declares', () => {
    for (const type of definition.routes.length ? ${JSON.stringify(service.events.map((e) => e.type))} : []) {
      const contract = eventContract(type);
      expect(contract, \`missing contract for \${type}\`).toBeDefined();
      expect(contract!.owner).toBe('${service.id}');
    }
  });

  it('publishes ${firstEvent.type} in a shape its consumers can read', async () => {
    const contract = eventContract('${firstEvent.type}')!;
    const parsed = contract.payload.safeParse(contract.example);
    expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
  });

  it('subscribes to all ${consumed.length} events declared in architecture/relations.yaml', () => {
    const subscribed = new Set(definition.consumers.map((c) => c.event));
    for (const expected of ${JSON.stringify([...new Set(consumed.map((c) => c.ref))])}) {
      expect(subscribed.has(expected), \`${service.id} does not consume \${expected}\`).toBe(true);
    }
  });

  it('records a signal when a partner ministry publishes', async () => {
${
  consumed.length
    ? `    const relation = { event: '${consumed[0].ref}', from: '${consumed[0].source}' };
    await platform.publish(relation.from, relation.event);
    const response = await platform.get('${service.id}', '/signals');
    const items = (response.body as { items: Array<{ eventType: string }> }).items;
    expect(items.some((item) => item.eventType === relation.event)).toBe(true);`
    : `    expect(true).toBe(true); // this service consumes nothing yet`
}
  });

  it('degrades cleanly when a dependency is missing', async () => {
    const response = await platform.get('${service.id}', '/dependencies');
    expect(response.status).toBe(200);
    for (const dependency of (response.body as { items: Array<{ detail?: string }> }).items) {
      // Never a raw connection error in a student's face (§28).
      expect(dependency.detail ?? '').not.toMatch(/ECONNREFUSED|ETIMEDOUT/);
    }
  });
});
`;
}

function generateExample(service) {
  const firstEvent = service.events[0];
  return `# Examples — ${service.name}

Runnable against a started platform (\`pnpm dev\`).

## Read

\`\`\`bash
curl http://localhost:4000/api/${service.id}/health
curl "http://localhost:4000/api/${service.id}/${service.entity.collection}?limit=5"
curl "http://localhost:4000/api/${service.id}/signals?limit=10"
curl http://localhost:4000/api/${service.id}/dependencies
curl http://localhost:4000/api/${service.id}/twins
\`\`\`

## Write

\`\`\`bash
# Every field is optional — omitted fields are filled with synthetic values.
curl -X POST http://localhost:4000/api/${service.id}/${service.entity.collection} \\
  -H 'content-type: application/json' \\
  -d '{}'
\`\`\`

## Watch an event travel

\`\`\`bash
# 1. see who is listening
curl http://localhost:4000/__platform/events | grep -A3 '${firstEvent.type}'

# 2. trigger something in this ministry, then follow the trace
curl http://localhost:4000/__platform/flows | head -40
\`\`\`

## Cross-ministry

\`\`\`bash
# The gateway is the only entry point; every ministry is behind it.
curl http://localhost:4000/__platform/services
curl http://localhost:4000/api/${service.id}/openapi.json
\`\`\`
`;
}

// ---------------------------------------------------------------------------
// 4. Platform-wide derived files
// ---------------------------------------------------------------------------

function servicesYaml() {
  return YAML.stringify({
    version: 1,
    generated_from: 'tools/spec/services.part1.mjs + services.part2.mjs',
    minimum_partners_per_service: MINIMUM_PARTNERS,
    services: SERVICES.map((service) => ({
      id: service.id,
      name: service.name,
      ministry: service.ministry,
      description: service.summary,
      capabilities: service.modules.map((m) => m.purpose),
      owns: service.owns,
      apis: service.apis.map((api) => {
        const method = api.method ?? (api.archetype === 'create' ? 'POST' : 'GET');
        const path =
          api.path ??
          (api.archetype === 'list'
            ? `/${service.entity.collection}`
            : api.archetype === 'get'
              ? `/${service.entity.collection}/:id`
              : `/${service.entity.collection}`);
        return `${method} /api/${service.id}${path}`;
      }),
      publishes: service.events.map((e) => e.type),
      consumes: (RELATIONS[service.id] ?? []).filter((r) => r.kind === 'event').map((r) => r.ref),
      depends_on: [...new Set((RELATIONS[service.id] ?? []).map((r) => r.source))].sort(),
      related_services: connectivity()[service.id],
      ai_capabilities: service.ai,
      iot_capabilities: service.iot,
      digital_twin_capabilities: service.twin,
    })),
  });
}

function relationsYaml() {
  return YAML.stringify({
    version: 1,
    generated_from: 'tools/spec/relations.mjs',
    note: 'source PROVIDES, target CONSUMES.',
    total: relationEdges().length,
    relations: relationEdges().map((edge) => ({
      source: edge.source,
      target: edge.target,
      relationship_type: edge.kind === 'event' ? 'event-producer-to-consumer' : 'api-provider-to-consumer',
      reason: edge.reason,
      contract:
        edge.kind === 'event'
          ? `packages/contracts/src/events/${edge.source}.ts`
          : `/api/${edge.source} (OpenAPI at /api/${edge.source}/openapi.json)`,
      events: edge.kind === 'event' ? [edge.ref] : [],
      apis: edge.kind === 'api' ? [`/api/${edge.source}${edge.ref.split(' ')[1]}`] : [],
      criticality: edge.criticality,
      implemented_in:
        edge.kind === 'event'
          ? `services/${edge.target}/src/consumers.ts`
          : `services/${edge.target}/src/adapters.ts`,
    })),
  });
}

function contractsServicesTs() {
  const directory = SERVICES.map(
    (service) => `  '${service.id}': {
    id: '${service.id}',
    name: ${JSON.stringify(service.name)},
    ministry: ${JSON.stringify(service.ministry)},
    description: ${JSON.stringify(service.summary)},
    modules: [${service.modules.map((m) => `'${m.id}'`).join(', ')}],
    owns: [${service.owns.map((o) => `'${o}'`).join(', ')}],
  },`,
  ).join('\n');

  const relations = relationEdges()
    .map(
      (edge) =>
        `  { source: '${edge.source}', target: '${edge.target}', kind: '${edge.kind}', ref: '${edge.ref}', criticality: '${edge.criticality}', reason: ${JSON.stringify(edge.reason)} },`,
    )
    .join('\n');

  return `/**
 * THE SERVICE DIRECTORY AND THE RELATION GRAPH, AT RUNTIME.
 *
 * Generated by \`pnpm generate\` from tools/spec. The gateway, the SDK, the
 * portal and the architecture validator all read this rather than parsing YAML
 * at runtime, so there is exactly one graph in the process.
 */

export interface ServiceDirectoryEntry {
  id: string;
  name: string;
  ministry: string;
  description: string;
  modules: readonly string[];
  owns: readonly string[];
}

export const SERVICE_DIRECTORY = {
${directory}
} as const satisfies Record<string, ServiceDirectoryEntry>;

export type ServiceId = keyof typeof SERVICE_DIRECTORY;
export const SERVICE_IDS = Object.keys(SERVICE_DIRECTORY) as ServiceId[];

export interface ArchitectureRelation {
  source: string;
  target: string;
  kind: 'event' | 'api';
  ref: string;
  criticality: 'critical' | 'normal';
  reason: string;
}

export const ARCHITECTURE_RELATIONS: ArchitectureRelation[] = [
${relations}
];

export const MINIMUM_PARTNERS = ${MINIMUM_PARTNERS};

/**
 * THE HIERARCHY — 6 pôles × 4 ministries.
 * A pôle is a mentoring pod, a demo slot, and the set of ministries whose
 * relations are densest. See tools/spec/poles.mjs for why.
 */
export interface Pole {
  id: string;
  name: string;
  tagline: string;
  colour: string;
  services: readonly string[];
}

export const POLES: readonly Pole[] = [
${POLES.map(
  (pole) => `  {
    id: '${pole.id}',
    name: ${JSON.stringify(pole.name)},
    tagline: ${JSON.stringify(pole.tagline)},
    colour: '${pole.colour}',
    services: [${pole.services.map((s) => `'${s}'`).join(', ')}],
  },`,
).join('\n')}
];

export function poleOf(serviceId: string): Pole | undefined {
  return POLES.find((pole) => pole.services.includes(serviceId));
}

/** Distinct partner ministries per service, both directions (§2). */
export function partnersOf(serviceId: string): string[] {
  const partners = new Set<string>();
  for (const relation of ARCHITECTURE_RELATIONS) {
    if (relation.source === serviceId) partners.add(relation.target);
    if (relation.target === serviceId) partners.add(relation.source);
  }
  return [...partners].sort();
}

export function relationsFor(serviceId: string): { incoming: ArchitectureRelation[]; outgoing: ArchitectureRelation[] } {
  return {
    incoming: ARCHITECTURE_RELATIONS.filter((r) => r.target === serviceId),
    outgoing: ARCHITECTURE_RELATIONS.filter((r) => r.source === serviceId),
  };
}
`;
}

function servicesRegistryTs() {
  return `/**
 * SERVICE REGISTRY — how the platform finds the 24 ministries.
 *
 * Generated by \`pnpm generate\`. Dynamic imports, so \`pnpm dev:service health\`
 * can load one ministry without paying for the other 23.
 */
import type { ServiceDefinition } from '@platform/service-kit';

export const SERVICE_MODULES: Record<string, () => Promise<{ default: ServiceDefinition }>> = {
${SERVICES.map((s) => `  '${s.id}': () => import('./${s.id}/src/index.ts'),`).join('\n')}
};

export const SERVICE_IDS = Object.keys(SERVICE_MODULES);

export async function loadService(id: string): Promise<ServiceDefinition> {
  const loader = SERVICE_MODULES[id];
  if (!loader) {
    throw new Error(
      \`Unknown service "\${id}". The 24 ids are: \${SERVICE_IDS.join(', ')}\`,
    );
  }
  return (await loader()).default;
}

export async function loadAllServices(): Promise<ServiceDefinition[]> {
  return Promise.all(SERVICE_IDS.map((id) => loadService(id)));
}
`;
}

function contractsEventsIndex() {
  return `/**
 * Importing this barrel registers all ${allEvents().length} event contracts.
 * Generated by \`pnpm generate\`.
 */
export * from '../services.ts';
${SERVICES.map((s) => `export * from './${s.id}.ts';`).join('\n')}
`;
}

function serviceIndexDoc() {
  const rows = SERVICES.map(
    (s) =>
      `| ${SERVICES.indexOf(s) + 1} | [\`${s.id}\`](../services/${s.id}/STUDENT_GUIDE.md) | ${s.name} | ${s.ministry} | ${s.events.length} | ${(RELATIONS[s.id] ?? []).length} | ${connectivity()[s.id].length} |`,
  ).join('\n');

  return `# The 24 ministry services

Generated by \`pnpm generate\`. Each row links to that ministry's student guide.

| # | id | Service | Ministry | Publishes | Consumes | Partners |
| --- | --- | --- | --- | --- | --- | --- |
${rows}

**Totals:** ${SERVICES.length} services · ${allEvents().length} event contracts ·
${relationEdges().length} declared relations · minimum ${Math.min(...Object.values(connectivity()).map((p) => p.length))} partners per service (target ${MINIMUM_PARTNERS}).
`;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log(
  `\n  Generating the national platform${FORCE ? ' (--force: rewriting seeded files too)' : ''}…\n`,
);

for (const service of SERVICES) {
  const base = `services/${service.id}`;

  // derived
  write(`${base}/service.manifest.yaml`, manifest(service), { derived: true });
  write(`${base}/RELATIONS.md`, relationsDoc(service), { derived: true });
  write(`${base}/API.md`, apiDoc(service), { derived: true });
  write(`${base}/EVENTS.md`, eventsDoc(service), { derived: true });

  // seeded
  write(`${base}/README.md`, serviceReadme(service));
  write(`${base}/SERVICE_BRIEF.md`, serviceBrief(service));
  write(`${base}/STUDENT_GUIDE.md`, studentGuide(service));
  write(`${base}/src/index.ts`, generateServiceIndex(service));
  write(`${base}/src/domain.ts`, generateDomain(service));
  write(`${base}/src/seed.ts`, generateSeed(service));
  write(`${base}/src/routes.ts`, generateRoutes(service));
  write(`${base}/src/consumers.ts`, generateConsumers(service));
  write(`${base}/src/adapters.ts`, generateAdapters(service));
  for (const [moduleId, content] of Object.entries(generateModules(service))) {
    write(`${base}/src/modules/${moduleId}.ts`, content);
  }
  write(`${base}/tests/${service.id}.test.ts`, generateTests(service));
  write(`${base}/examples/README.md`, generateExample(service));

  write(`packages/contracts/src/events/${service.id}.ts`, generateEventContracts(service));
}

write('architecture/services.yaml', servicesYaml(), { derived: true });
write('architecture/relations.yaml', relationsYaml(), { derived: true });
write('packages/contracts/src/services.ts', contractsServicesTs(), { derived: true });
write('packages/contracts/src/events/index.ts', contractsEventsIndex(), { derived: true });
write('services/registry.ts', servicesRegistryTs(), { derived: true });
write('docs/SERVICE_INDEX.md', serviceIndexDoc(), { derived: true });

const partnerCounts = Object.values(connectivity()).map((p) => p.length);
console.log(`  services            ${SERVICES.length}`);
console.log(`  event contracts     ${allEvents().length}`);
console.log(`  relations           ${relationEdges().length}`);
console.log(
  `  partners per service min ${Math.min(...partnerCounts)} / target ${MINIMUM_PARTNERS} / max ${Math.max(...partnerCounts)}`,
);
console.log(`\n  written ${written} files, left ${skipped} existing files untouched.\n`);
