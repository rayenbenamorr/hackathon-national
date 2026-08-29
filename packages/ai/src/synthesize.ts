import { z } from 'zod';
import { seededRandom } from '@platform/geo';

/**
 * The heart of mock mode.
 *
 * `ai.structured(schema, prompt)` must return an object that PASSES the
 * student's own zod schema, offline, with no API key — otherwise "works without
 * a key" is a slogan and the first demo at 3 a.m. fails on a missing field.
 *
 * So the mock provider does not fake a language model; it walks the schema and
 * synthesises a valid, deterministic, plausible value for every branch. Field
 * NAMES steer the numbers (`…​Probability` lands in 0–1, `…​Mm` looks like
 * rainfall, `confidence` is high-ish) so a mocked forecast reads like a
 * forecast rather than like `{"value": 0}`.
 */
export function synthesizeFromSchema<S extends z.ZodTypeAny>(schema: S, seed: string, key = ''): z.infer<S> {
  const rng = seededRandom(`${seed}:${key}`);
  return walk(schema, rng, key) as z.infer<S>;
}

const LOREM = [
  'Signal consistent with the seasonal baseline.',
  'Deviation detected in the southern corridor; monitoring advised.',
  'Capacity remains within operating limits for the next 48 hours.',
  'Cross-sector dependency identified; coordination recommended.',
  'Trend improving compared with the previous observation window.',
];

function numberFor(key: string, rng: () => number): number {
  const k = key.toLowerCase();
  const r = rng();
  if (/(probability|score|index|share|ratio|confidence|risk|rate|pct|percent)/.test(k)) {
    return Number((/(confidence)/.test(k) ? 0.6 + r * 0.35 : r).toFixed(3));
  }
  if (/(lat)$/.test(k)) return Number((33 + r * 4).toFixed(5));
  if (/(lon|lng)$/.test(k)) return Number((8 + r * 3).toFixed(5));
  if (/(mm|rain|precip)/.test(k)) return Number((r * 40).toFixed(1));
  if (/(temperature|temp|celsius)/.test(k)) return Number((14 + r * 24).toFixed(1));
  if (/(tnd|cost|budget|amount|price)/.test(k)) return Math.round(r * 900_000);
  if (/(count|total|beds|units|people|population|volume)/.test(k)) return Math.round(r * 500);
  if (/(days|hours|horizon|duration|minutes)/.test(k)) return Math.max(1, Math.round(r * 14));
  return Number((r * 100).toFixed(2));
}

function stringFor(key: string, rng: () => number): string {
  const k = key.toLowerCase();
  const r = rng();
  if (/(id)$/.test(k)) return `${k.replace(/id$/, '') || 'mock'}_${Math.floor(r * 1e9).toString(36)}`;
  if (/(at|date|timestamp|time)$/.test(k)) return new Date(Date.now() + (r - 0.5) * 864e5).toISOString();
  if (/(governorate)/.test(k)) return ['TN-11', 'TN-41', 'TN-61', 'TN-71', 'TN-82'][Math.floor(r * 5)];
  if (/(unit)/.test(k)) return ['mm', 'm3', '%', 'MW', 'index'][Math.floor(r * 5)];
  if (/(summary|explanation|reason|rationale|description|message|recommendation|note)/.test(k)) {
    return LOREM[Math.floor(r * LOREM.length)];
  }
  if (/(name|label|title)/.test(k))
    return `Synthetic ${k.replace(/[^a-z]/g, '') || 'item'} ${Math.floor(r * 90) + 10}`;
  return `synthetic-${Math.floor(r * 1e6).toString(36)}`;
}

function walk(schema: z.ZodTypeAny, rng: () => number, key: string): unknown {
  const def = schema._def as { typeName?: string; [k: string]: unknown };

  switch (def.typeName) {
    case 'ZodString':
      return stringFor(key, rng);
    case 'ZodNumber': {
      // The schema wins over the field-name heuristic. `z.number().int()` must
      // produce an integer or the event contract rejects the result — which is
      // exactly the bug the bus caught the first time this ran.
      const checks = (def.checks ?? []) as Array<{ kind: string; value?: number }>;
      const min = checks.find((c) => c.kind === 'min')?.value;
      const max = checks.find((c) => c.kind === 'max')?.value;
      let value = numberFor(key, rng);
      if (min !== undefined || max !== undefined) {
        const low = min ?? 0;
        const high = max ?? low + 100;
        value = Number((low + rng() * (high - low)).toFixed(3));
      }
      if (checks.some((c) => c.kind === 'int')) value = Math.round(value);
      if (min !== undefined) value = Math.max(min, value);
      if (max !== undefined) value = Math.min(max, value);
      return value;
    }
    case 'ZodBoolean':
      return rng() > 0.4;
    case 'ZodDate':
      return new Date();
    case 'ZodLiteral':
      return def.value;
    case 'ZodEnum': {
      const values = def.values as string[];
      return values[Math.floor(rng() * values.length)];
    }
    case 'ZodNativeEnum': {
      const values = Object.values(def.values as Record<string, unknown>);
      return values[Math.floor(rng() * values.length)];
    }
    case 'ZodArray': {
      const n = 1 + Math.floor(rng() * 3);
      return Array.from({ length: n }, (_, i) => walk(def.type as z.ZodTypeAny, rng, `${key}[${i}]`));
    }
    case 'ZodObject': {
      const shape = (def.shape as () => Record<string, z.ZodTypeAny>)();
      const out: Record<string, unknown> = {};
      for (const [field, sub] of Object.entries(shape)) out[field] = walk(sub, rng, field);
      return out;
    }
    case 'ZodOptional':
    case 'ZodNullable':
      return walk(def.innerType as z.ZodTypeAny, rng, key);
    case 'ZodDefault':
      return walk(def.innerType as z.ZodTypeAny, rng, key);
    case 'ZodUnion': {
      const options = def.options as z.ZodTypeAny[];
      return walk(options[Math.floor(rng() * options.length)], rng, key);
    }
    case 'ZodEffects':
      return walk(def.schema as z.ZodTypeAny, rng, key);
    case 'ZodRecord':
      return { [stringFor('key', rng)]: walk(def.valueType as z.ZodTypeAny, rng, key) };
    case 'ZodTuple':
      return (def.items as z.ZodTypeAny[]).map((item, i) => walk(item, rng, `${key}${i}`));
    case 'ZodAny':
    case 'ZodUnknown':
      return stringFor(key, rng);
    default:
      return null;
  }
}
