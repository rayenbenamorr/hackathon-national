/**
 * `pnpm doctor` — the first thing to run when something is wrong.
 *
 * Answers, in ten lines, the questions a beginner cannot answer alone: is my
 * environment right, is the platform running, are all 24 ministries up, is the
 * AI in mock mode, and is my architecture still valid.
 */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv } from '@platform/runtime';
import {
  SERVICE_DIRECTORY,
  MINIMUM_PARTNERS,
  partnersOf,
  ARCHITECTURE_RELATIONS,
  allEventContracts,
} from '@platform/contracts';
import { SENSOR_KINDS } from '@platform/iot';
import { fail, pass, probePlatform, renderChecks, summarise, warn, type CheckResult } from '../index.ts';

loadEnv();

const results: CheckResult[] = [];
const port = Number(process.env.PLATFORM_PORT ?? 4000);

// --- environment -----------------------------------------------------------
const [major] = process.versions.node.split('.').map(Number);
results.push(
  major >= 20
    ? pass('Node.js', `v${process.versions.node}`)
    : fail(
        'Node.js',
        `v${process.versions.node} is too old`,
        'Install Node.js 20 or newer: https://nodejs.org',
      ),
);

results.push(
  existsSync(resolve('node_modules'))
    ? pass('Dependencies', 'installed')
    : fail('Dependencies', 'node_modules is missing', 'Run: pnpm install'),
);

results.push(
  existsSync(resolve('.env'))
    ? pass('.env', 'present')
    : warn('.env', 'absent — the platform runs on safe defaults', 'Optional: cp .env.example .env'),
);

const dataDir = resolve(process.env.DATA_DIR ?? '.data');
results.push(
  existsSync(dataDir)
    ? pass(
        'Local data',
        `${readdirSync(dataDir).filter((f) => f.endsWith('.json')).length} service databases in ${process.env.DATA_DIR ?? '.data'}/`,
      )
    : warn('Local data', 'no database yet — it is created on first start', 'Run: pnpm dev'),
);

// --- architecture ----------------------------------------------------------
const declared = Object.keys(SERVICE_DIRECTORY);
results.push(
  declared.length === 24
    ? pass('Services declared', '24 ministry services')
    : fail('Services declared', `${declared.length} instead of 24`, 'Run: pnpm generate'),
);

const missingServiceDirs = declared.filter((id) => !existsSync(resolve('services', id, 'src', 'index.ts')));
results.push(
  missingServiceDirs.length === 0
    ? pass('Service code', 'every ministry has source')
    : fail('Service code', `missing: ${missingServiceDirs.join(', ')}`, 'Run: pnpm generate'),
);

const under = declared.filter((id) => partnersOf(id).length < MINIMUM_PARTNERS);
results.push(
  under.length === 0
    ? pass(
        'Connectivity',
        `every service reaches ≥ ${MINIMUM_PARTNERS} partners (${ARCHITECTURE_RELATIONS.length} relations)`,
      )
    : fail(
        'Connectivity',
        `below target: ${under.join(', ')}`,
        'Add relations in tools/spec/relations.mjs, then: pnpm generate',
      ),
);

results.push(pass('Event contracts', `${allEventContracts().length} declared and validated`));
results.push(pass('Sensor kinds', `${SENSOR_KINDS.length} available — pnpm simulate:sensor --list`));

// --- AI --------------------------------------------------------------------
const provider = process.env.AI_PROVIDER ?? 'mock';
if (provider === 'mock') {
  results.push(pass('AI', 'mock mode — works offline, no API key, nothing billed'));
} else {
  const key = provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENROUTER_API_KEY;
  results.push(
    key
      ? warn('AI', `${provider} with a real key — calls leave this machine and cost money`)
      : fail(
          'AI',
          `AI_PROVIDER=${provider} but no API key is set`,
          'Put the key in .env, or set AI_PROVIDER=mock',
        ),
  );
}

// --- running platform ------------------------------------------------------
const probe = await probePlatform(port);
if (probe.up) {
  const health = probe.body as {
    running: number;
    declared: number;
    missing: string[];
    bus: { subscriptions: number };
  };
  results.push(
    health.running === health.declared
      ? pass(
          'Platform',
          `running on :${port} — ${health.running}/24 services, ${health.bus.subscriptions} subscriptions`,
        )
      : fail(
          'Platform',
          `running on :${port} but only ${health.running}/24 services (missing: ${health.missing.join(', ')})`,
          'Look at the terminal running `pnpm dev` — the failing service printed why.',
        ),
  );
} else {
  results.push(warn('Platform', `not running on :${port}`, 'Start it in another terminal: pnpm dev'));
}

// --- report ----------------------------------------------------------------
const { failed, warned, passed } = summarise(results);

console.log(`\n  PLATFORM DOCTOR\n`);
console.log(renderChecks(results));
console.log(
  `\n  ${passed} ok · ${warned} warning${warned === 1 ? '' : 's'} · ${failed} problem${failed === 1 ? '' : 's'}\n`,
);

if (failed === 0) {
  console.log(
    '  Tout est en ordre. Ouvrez http://localhost:' +
      port +
      ' et dites à Claude Code ce que vous voulez construire.',
  );
  console.log(
    '  Everything is fine. Open http://localhost:' + port + ' and tell Claude Code what you want to build.\n',
  );
} else {
  console.log('  Corrigez les lignes ✗ ci-dessus, puis relancez `pnpm doctor`.');
  console.log('  Fix the ✗ lines above, then run `pnpm doctor` again.\n');
}

process.exit(failed === 0 ? 0 : 1);
