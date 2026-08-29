/**
 * `pnpm dns:plan` / `pnpm dns:apply` — create the 24 ministry records on Cloudflare.
 *
 * DRY RUN BY DEFAULT. Nothing is written without `--confirm`, because DNS is
 * outward-facing and a wrong record is visible to the whole internet before
 * anyone notices.
 *
 *   pnpm dns:plan                              what would change
 *   pnpm dns:plan --aliases                    include the alternative labels
 *   pnpm dns:apply --target platform.tukhnanutha.com --confirm
 *
 * Credentials are read from the environment, or from a file passed with
 * `--env-file` (e.g. ~/.secrets/tukhnanutha-cloudflare.env). The token is never
 * printed, never logged, and never written anywhere.
 */
import { existsSync, readFileSync } from 'node:fs';
import { baseDomain, loadEnv, MINISTRY_DOMAINS } from '@platform/runtime';

loadEnv();

const argv = process.argv.slice(2);
const has = (flag: string) => argv.includes(`--${flag}`);
const value = (flag: string) => {
  const i = argv.indexOf(`--${flag}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

// --- credentials ------------------------------------------------------------

const envFile = value('env-file');
if (envFile) {
  if (!existsSync(envFile)) {
    console.error(`\n  No such file: ${envFile}\n`);
    process.exit(1);
  }
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line.trim());
    if (!match || line.trim().startsWith('#')) continue;
    const [, key, raw] = match;
    const clean = raw.replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined) process.env[key] = clean;
  }
}

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error(`
  CLOUDFLARE_API_TOKEN is not set.

  Either export it, or point at the file that holds it:
      pnpm dns:plan --env-file ~/.secrets/tukhnanutha-cloudflare.env

  The token needs the "Zone → DNS → Edit" permission on the zone. A token that
  can only deploy Workers will fail at the first write with HTTP 403.
`);
  process.exit(1);
}

const base = baseDomain();
const target = value('target') ?? `platform.${base}`;
const withAliases = has('aliases');
const confirm = has('confirm');
const proxied = !has('no-proxy');
const ttl = 1; // 1 = automatic, which is what Cloudflare wants for proxied records

// --- API --------------------------------------------------------------------

interface CfRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
}

async function cf<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(20_000),
  });

  const body = (await response.json()) as {
    success: boolean;
    result: T;
    errors?: Array<{ message: string }>;
  };
  if (!response.ok || !body.success) {
    const detail = body.errors?.map((e) => e.message).join('; ') ?? `HTTP ${response.status}`;
    throw new Error(`Cloudflare API: ${detail}   (${init.method ?? 'GET'} ${path})`);
  }
  return body.result;
}

// --- plan -------------------------------------------------------------------

console.log(`\n  MINISTRY DNS — zone ${base}\n`);
console.log(`  origin   ${target}`);
console.log(`  proxied  ${proxied ? 'yes (orange cloud — Cloudflare terminates TLS)' : 'NO (grey cloud)'}`);
console.log(
  `  mode     ${confirm ? '\x1b[33mAPPLY — records will be written\x1b[0m' : 'dry run (nothing is written)'}\n`,
);

const zones = await cf<Array<{ id: string; name: string }>>(`/zones?name=${encodeURIComponent(base)}`);
const zone = zones[0];
if (!zone) {
  console.error(`  The zone "${base}" is not on this Cloudflare account (or the token cannot see it).\n`);
  process.exit(1);
}

const existing = await cf<CfRecord[]>(`/zones/${zone.id}/dns_records?per_page=500`);
const byName = new Map(existing.map((record) => [record.name.toLowerCase(), record]));

interface Action {
  name: string;
  ministry: string;
  verdict: 'create' | 'update' | 'ok' | 'conflict';
  detail: string;
  record?: CfRecord;
}

const actions: Action[] = [];

for (const domain of MINISTRY_DOMAINS) {
  const labels = withAliases ? [domain.slug, ...domain.aliases] : [domain.slug];
  for (const label of labels) {
    const name = `${label}.${base}`;
    const current = byName.get(name);

    if (!current) {
      actions.push({ name, ministry: domain.service, verdict: 'create', detail: `CNAME → ${target}` });
    } else if (current.type !== 'CNAME') {
      actions.push({
        name,
        ministry: domain.service,
        verdict: 'conflict',
        detail: `already exists as ${current.type} → ${current.content}. Left untouched.`,
        record: current,
      });
    } else if (current.content.toLowerCase() !== target.toLowerCase() || current.proxied !== proxied) {
      actions.push({
        name,
        ministry: domain.service,
        verdict: 'update',
        detail: `${current.content} (proxied=${current.proxied}) → ${target} (proxied=${proxied})`,
        record: current,
      });
    } else {
      actions.push({ name, ministry: domain.service, verdict: 'ok', detail: 'already correct' });
    }
  }
}

const icon = {
  create: '\x1b[32m+\x1b[0m',
  update: '\x1b[33m~\x1b[0m',
  ok: '\x1b[90m=\x1b[0m',
  conflict: '\x1b[31m!\x1b[0m',
};
for (const action of actions) {
  console.log(
    `  ${icon[action.verdict]} ${action.name.padEnd(40)} ${action.ministry.padEnd(24)} ${action.detail}`,
  );
}

const counts = {
  create: actions.filter((a) => a.verdict === 'create').length,
  update: actions.filter((a) => a.verdict === 'update').length,
  ok: actions.filter((a) => a.verdict === 'ok').length,
  conflict: actions.filter((a) => a.verdict === 'conflict').length,
};
console.log(
  `\n  ${counts.create} to create · ${counts.update} to update · ${counts.ok} already correct · ${counts.conflict} conflict(s)\n`,
);

if (counts.conflict) {
  console.log(`  Conflicts are NEVER touched by this tool: a name that already exists as A/AAAA/TXT`);
  console.log(`  belongs to something else. Resolve those by hand in the dashboard.\n`);
}

// --- apply ------------------------------------------------------------------

if (!confirm) {
  console.log(`  Nothing was written. To apply:`);
  console.log(`      pnpm dns:apply --target ${target} --confirm\n`);
  process.exit(0);
}

let done = 0;
for (const action of actions) {
  if (action.verdict === 'ok' || action.verdict === 'conflict') continue;

  const payload = {
    type: 'CNAME',
    name: action.name,
    content: target,
    ttl,
    proxied,
    comment: 'hackathon ministry',
  };
  try {
    if (action.verdict === 'create') {
      await cf(`/zones/${zone.id}/dns_records`, { method: 'POST', body: JSON.stringify(payload) });
    } else {
      await cf(`/zones/${zone.id}/dns_records/${action.record!.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    }
    done += 1;
    console.log(`  \x1b[32m✓\x1b[0m ${action.name}`);
  } catch (error) {
    console.error(`  \x1b[31m✗\x1b[0m ${action.name} — ${error instanceof Error ? error.message : error}`);
  }
}

console.log(`\n  ${done} record(s) written. Verify with:  pnpm domains --check\n`);
