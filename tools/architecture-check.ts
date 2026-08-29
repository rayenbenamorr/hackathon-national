/**
 * `pnpm architecture:check` — the guard rail (§23).
 *
 * Thirteen rules. It fails loudly and specifically: every failure names the
 * file to open and the change to make. This is what stops 300 teams editing one
 * platform from producing an architecture nobody can explain by Wednesday.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadEnv } from '@platform/runtime';
import {
  allEventContracts,
  ARCHITECTURE_RELATIONS,
  eventContract,
  MINIMUM_PARTNERS,
  partnersOf,
  SERVICE_DIRECTORY,
} from '@platform/contracts';
import { loadAllServices } from '../services/registry.ts';
import type { ServiceDefinition } from '@platform/service-kit';

loadEnv();

interface Problem {
  rule: string;
  message: string;
  where?: string;
  fix?: string;
}

const problems: Problem[] = [];
const passes: string[] = [];

function rule(name: string, check: () => Problem[] | void): void {
  const found = check() ?? [];
  if (found.length === 0) passes.push(name);
  else problems.push(...found.map((p) => ({ ...p, rule: name })));
}

const ROOT = resolve('.');
const ids = Object.keys(SERVICE_DIRECTORY);

let definitions: ServiceDefinition[] = [];
try {
  definitions = await loadAllServices();
} catch (error) {
  console.error(`\n  Could not load the services: ${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
}
const byId = new Map(definitions.map((d) => [d.id, d]));

// --- 1 ---------------------------------------------------------------------
rule('1. All 24 ministry services exist', () => {
  const out: Problem[] = [];
  if (ids.length !== 24) {
    out.push({
      rule: '',
      message: `${ids.length} services declared instead of 24.`,
      fix: 'Edit tools/spec/services.part*.mjs then run pnpm generate.',
    });
  }
  for (const id of ids) {
    if (!existsSync(join(ROOT, 'services', id, 'src', 'index.ts'))) {
      out.push({ rule: '', message: `services/${id}/src/index.ts is missing.`, fix: 'pnpm generate' });
    }
    if (!byId.has(id))
      out.push({ rule: '', message: `services/${id} does not export a service definition.` });
  }
  return out;
});

// --- 2 ---------------------------------------------------------------------
rule('2. Every service has a manifest and the mandated documents (§17)', () => {
  const required = [
    'README.md',
    'SERVICE_BRIEF.md',
    'service.manifest.yaml',
    'RELATIONS.md',
    'API.md',
    'EVENTS.md',
    'STUDENT_GUIDE.md',
  ];
  const out: Problem[] = [];
  for (const id of ids) {
    for (const file of required) {
      if (!existsSync(join(ROOT, 'services', id, file))) {
        out.push({ rule: '', message: `services/${id}/${file} is missing.`, fix: 'pnpm generate' });
      }
    }
    for (const dir of ['src', 'tests', 'examples']) {
      if (!existsSync(join(ROOT, 'services', id, dir))) {
        out.push({ rule: '', message: `services/${id}/${dir}/ is missing.`, fix: 'pnpm generate' });
      }
    }
  }
  return out;
});

// --- 3 ---------------------------------------------------------------------
rule('3. Every service exposes APIs and takes part in the event system', () => {
  const out: Problem[] = [];
  for (const definition of definitions) {
    if (definition.routes.length === 0) out.push({ rule: '', message: `${definition.id} exposes no route.` });
    if (!definition.routes.some((r) => r.path === '/health')) {
      out.push({
        rule: '',
        message: `${definition.id} has no GET /health.`,
        fix: 'Every service must answer /health — see services/*/src/routes.ts.',
      });
    }
    const owned = allEventContracts().filter((c) => c.owner === definition.id);
    if (owned.length === 0 && definition.consumers.length === 0) {
      out.push({
        rule: '',
        message: `${definition.id} neither publishes nor consumes any event — it is an island (§2).`,
      });
    }
  }
  return out;
});

// --- 4 ---------------------------------------------------------------------
rule('4. No service reads another service database (§7)', () => {
  const out: Problem[] = [];
  const banned: Array<{ pattern: RegExp; why: string }> = [
    {
      pattern: /openServiceStore\s*\(/,
      why: 'opens a store namespace directly — use ctx.db, which is already scoped to this service',
    },
    {
      pattern: /inspectAllStores\s*\(/,
      why: 'reads every service database — that helper is for the platform tooling only',
    },
    { pattern: /setStoreAdapter\s*\(/, why: 'replaces the storage engine for the whole platform' },
    {
      pattern: /from\s+'\.\.\/\.\.\/(?!\.)[a-z-]+\/src/,
      why: 'imports another ministry source directly — cross-service code must go through the API or the bus',
    },
    { pattern: /\.data[/\\][a-z-]+\.json/, why: 'reads another service database file from disk' },
  ];

  for (const id of ids) {
    for (const file of walk(join(ROOT, 'services', id, 'src'))) {
      const source = readFileSync(file, 'utf8');
      for (const { pattern, why } of banned) {
        if (pattern.test(source)) {
          out.push({
            rule: '',
            message: `${id} ${why}.`,
            where: file.replace(`${ROOT}\\`, '').replace(`${ROOT}/`, ''),
            fix: 'Use ctx.platform.call()/tryCall() for a synchronous read, or consume the event instead.',
          });
        }
      }
    }
  }
  return out;
});

// --- 5 ---------------------------------------------------------------------
rule('5. Every event contract is valid and its example matches it', () => {
  const out: Problem[] = [];
  for (const contract of allEventContracts()) {
    const parsed = contract.payload.safeParse(contract.example);
    if (!parsed.success) {
      out.push({
        rule: '',
        message: `${contract.type}: the declared example does not satisfy its own payload schema (${parsed.error.issues[0]?.message}).`,
        where: `packages/contracts/src/events/${contract.owner}.ts`,
      });
    }
    if (!/\.v\d+$/.test(contract.type)) {
      out.push({ rule: '', message: `${contract.type} is not versioned. Event types end with .v1, .v2 …` });
    }
  }
  return out;
});

// --- 6 ---------------------------------------------------------------------
rule('6. Every relation points at services that exist', () => {
  const out: Problem[] = [];
  for (const relation of ARCHITECTURE_RELATIONS) {
    if (!ids.includes(relation.source))
      out.push({ rule: '', message: `relation source "${relation.source}" is not a ministry service.` });
    if (!ids.includes(relation.target))
      out.push({ rule: '', message: `relation target "${relation.target}" is not a ministry service.` });
    if (relation.source === relation.target)
      out.push({ rule: '', message: `${relation.source} declares a relation with itself.` });
  }
  return out;
});

// --- 7 ---------------------------------------------------------------------
rule('7. Every declared event relation is implemented in the consumer', () => {
  const out: Problem[] = [];
  for (const relation of ARCHITECTURE_RELATIONS.filter((r) => r.kind === 'event')) {
    const consumer = byId.get(relation.target);
    if (!consumer) continue;
    const found = consumer.consumers.find((c) => c.event === relation.ref);
    if (!found) {
      out.push({
        rule: '',
        message: `${relation.target} declares it consumes ${relation.ref} but has no handler for it.`,
        where: `services/${relation.target}/src/consumers.ts`,
        fix: 'Add the consumer, or remove the relation from tools/spec/relations.mjs.',
      });
    } else if (found.from !== relation.source) {
      out.push({
        rule: '',
        message: `${relation.target} says ${relation.ref} comes from "${found.from}" but the registry says "${relation.source}".`,
        where: `services/${relation.target}/src/consumers.ts`,
      });
    }
  }
  return out;
});

// --- 8 ---------------------------------------------------------------------
rule('8. Every event has exactly one owner, and consumers reference real events', () => {
  const out: Problem[] = [];
  const owners = new Map<string, string>();
  for (const contract of allEventContracts()) {
    const existing = owners.get(contract.type);
    if (existing && existing !== contract.owner) {
      out.push({
        rule: '',
        message: `${contract.type} is claimed by both ${existing} and ${contract.owner}.`,
      });
    }
    owners.set(contract.type, contract.owner);
  }

  for (const definition of definitions) {
    for (const consumer of definition.consumers) {
      const contract = eventContract(consumer.event);
      if (!contract) {
        out.push({
          rule: '',
          message: `${definition.id} consumes "${consumer.event}", which no service publishes.`,
          where: `services/${definition.id}/src/consumers.ts`,
          fix: 'Declare the event with defineEvent() in packages/contracts, or fix the type name.',
        });
      } else if (contract.owner !== consumer.from) {
        out.push({
          rule: '',
          message: `${definition.id} expects "${consumer.event}" from ${consumer.from}, but it is owned by ${contract.owner}.`,
        });
      }
    }
  }
  return out;
});

// --- 9 ---------------------------------------------------------------------
rule('9. Every API relation is implemented as an adapter', () => {
  const out: Problem[] = [];
  for (const relation of ARCHITECTURE_RELATIONS.filter((r) => r.kind === 'api')) {
    const file = join(ROOT, 'services', relation.target, 'src', 'adapters.ts');
    if (!existsSync(file)) {
      out.push({
        rule: '',
        message: `services/${relation.target}/src/adapters.ts is missing.`,
        fix: 'pnpm generate',
      });
      continue;
    }
    const source = readFileSync(file, 'utf8');
    if (!source.includes(`'${relation.source}'`) || !source.includes(relation.ref)) {
      out.push({
        rule: '',
        message: `${relation.target} declares an API dependency on ${relation.source} (${relation.ref}) that is not in its adapters.`,
        where: `services/${relation.target}/src/adapters.ts`,
      });
    }
  }
  return out;
});

// --- 10 --------------------------------------------------------------------
rule(`10. Every service reaches ${MINIMUM_PARTNERS} partner ministries (§2)`, () => {
  const out: Problem[] = [];
  for (const id of ids) {
    const partners = partnersOf(id);
    if (partners.length < MINIMUM_PARTNERS) {
      out.push({
        rule: '',
        message: `${id} is connected to ${partners.length} ministries, below the target of ${MINIMUM_PARTNERS}.`,
        fix: 'Add relations with a real domain purpose in tools/spec/relations.mjs, then pnpm generate.',
      });
    }
  }
  return out;
});

// --- 11 --------------------------------------------------------------------
rule('11. No synchronous API dependency cycle', () => {
  // Event cycles are legitimate (that is what an event-driven system is for).
  // A cycle of SYNCHRONOUS calls is a deadlock waiting for a demo day.
  const graph = new Map<string, string[]>();
  for (const relation of ARCHITECTURE_RELATIONS.filter((r) => r.kind === 'api')) {
    if (!graph.has(relation.target)) graph.set(relation.target, []);
    graph.get(relation.target)!.push(relation.source);
  }

  const out: Problem[] = [];
  const state = new Map<string, 'visiting' | 'done'>();
  const stack: string[] = [];

  const visit = (node: string): void => {
    if (state.get(node) === 'done') return;
    if (state.get(node) === 'visiting') {
      const cycle = [...stack.slice(stack.indexOf(node)), node].join(' → ');
      out.push({
        rule: '',
        message: `Synchronous call cycle: ${cycle}.`,
        fix: 'Break it by turning one of those calls into an event.',
      });
      return;
    }
    state.set(node, 'visiting');
    stack.push(node);
    for (const next of graph.get(node) ?? []) visit(next);
    stack.pop();
    state.set(node, 'done');
  };

  for (const node of graph.keys()) visit(node);
  return out;
});

// --- 12 --------------------------------------------------------------------
rule('12. No duplicate ownership of an authoritative entity', () => {
  const out: Problem[] = [];
  const owners = new Map<string, string[]>();
  for (const [id, entry] of Object.entries(SERVICE_DIRECTORY)) {
    for (const owned of entry.owns) {
      if (!owners.has(owned)) owners.set(owned, []);
      owners.get(owned)!.push(id);
    }
  }
  for (const [entity, claimants] of owners) {
    if (claimants.length > 1) {
      out.push({
        rule: '',
        message: `"${entity}" is claimed by ${claimants.join(' and ')}. Exactly one ministry is authoritative for an entity.`,
        fix: 'Decide the owner in tools/spec; the others reference it through the shared refs in packages/refs.',
      });
    }
  }
  return out;
});

// --- 13 --------------------------------------------------------------------
rule('13. No secret is committed, and no alias table has drifted', () => {
  const out: Problem[] = [];

  const secretPatterns: Array<[RegExp, string]> = [
    [/sk-[A-Za-z0-9]{24,}/, 'an OpenAI-style secret key'],
    [/sk-ant-[A-Za-z0-9-]{20,}/, 'an Anthropic key'],
    [/AKIA[0-9A-Z]{16}/, 'an AWS access key id'],
    [/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, 'a private key'],
  ];

  for (const dir of ['packages', 'services', 'apps', 'tools', 'architecture', 'docs']) {
    for (const file of walk(join(ROOT, dir))) {
      const source = readFileSync(file, 'utf8');
      for (const [pattern, what] of secretPatterns) {
        if (pattern.test(source)) {
          out.push({
            rule: '',
            message: `${what} appears in the source.`,
            where: file.replace(ROOT, '.'),
            fix: 'Move it to .env, which is git-ignored, and rotate the key.',
          });
        }
      }
    }
  }

  // tsconfig paths and vitest aliases must list the same packages, or tests
  // pass while `pnpm typecheck` fails (or worse, the reverse).
  const tsconfig = readFileSync(join(ROOT, 'tsconfig.base.json'), 'utf8');
  const vitest = readFileSync(join(ROOT, 'vitest.config.ts'), 'utf8');
  const aliases = [...tsconfig.matchAll(/"(@platform\/[a-z-]+)":/g)].map((m) => m[1]);
  for (const alias of new Set(aliases)) {
    if (alias.endsWith('/*')) continue;
    if (!vitest.includes(`'${alias}'`)) {
      out.push({
        rule: '',
        message: `${alias} is declared in tsconfig.base.json but not in vitest.config.ts.`,
        fix: 'Add the same alias to vitest.config.ts.',
      });
    }
  }
  return out;
});

// ---------------------------------------------------------------------------

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|mjs|js|yaml|yml|json|md)$/.test(entry)) out.push(full);
  }
  return out;
}

// --- report ----------------------------------------------------------------

const partnerCounts = ids.map((id) => partnersOf(id).length);

console.log(`\n  ARCHITECTURE CHECK\n`);
console.log(
  `  ${ids.length} services · ${allEventContracts().length} event contracts · ${ARCHITECTURE_RELATIONS.length} relations`,
);
console.log(
  `  partners per service: min ${Math.min(...partnerCounts)} · target ${MINIMUM_PARTNERS} · max ${Math.max(...partnerCounts)}\n`,
);

for (const name of passes) console.log(`  \x1b[32m✓\x1b[0m ${name}`);

const grouped = new Map<string, Problem[]>();
for (const problem of problems) {
  if (!grouped.has(problem.rule)) grouped.set(problem.rule, []);
  grouped.get(problem.rule)!.push(problem);
}

for (const [name, list] of grouped) {
  console.log(`  \x1b[31m✗\x1b[0m ${name}  (${list.length})`);
  for (const problem of list.slice(0, 12)) {
    console.log(`      · ${problem.message}`);
    if (problem.where) console.log(`        in  ${problem.where}`);
    if (problem.fix) console.log(`        fix ${problem.fix}`);
  }
  if (list.length > 12) console.log(`      … and ${list.length - 12} more`);
}

if (problems.length === 0) {
  console.log(`\n  \x1b[32mArchitecture valid.\x1b[0m All 13 rules pass.\n`);
  process.exit(0);
}

console.log(`\n  \x1b[31m${problems.length} architecture violation(s).\x1b[0m Fix them before committing.\n`);
process.exit(1);
