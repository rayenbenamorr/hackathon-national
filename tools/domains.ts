/**
 * `pnpm domains` — the ministry ↔ subdomain map, and the DNS to create.
 *
 *   pnpm domains                 the table
 *   pnpm domains --zone          a BIND zone file, importable into Cloudflare
 *   pnpm domains --zone --target platform.example.com
 *   pnpm domains --aliases       include the alternative labels
 *   pnpm domains --check         verify every hostname actually answers
 */
import { loadEnv, baseDomain, MINISTRY_DOMAINS, RESERVED_LABELS } from '@platform/runtime';
import { SERVICE_DIRECTORY } from '@platform/contracts';

loadEnv();

const argv = process.argv.slice(2);
const has = (flag: string) => argv.includes(`--${flag}`);
const value = (flag: string) => {
  const i = argv.indexOf(`--${flag}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

const base = baseDomain();
const withAliases = has('aliases');

// --- BIND zone --------------------------------------------------------------

if (has('zone')) {
  const target = value('target') ?? `platform.${base}`;
  const ttl = value('ttl') ?? '300';

  console.log(`; Ministry subdomains for the national hackathon platform`);
  console.log(`; Base domain: ${base}`);
  console.log(`; Every name is a CNAME to a SINGLE origin: the platform routes by Host header.`);
  console.log(`; Import in Cloudflare: DNS → Records → Import and Export → Import.`);
  console.log(`; Proxy status: leave these PROXIED (orange cloud) so Cloudflare terminates TLS.`);
  console.log(`;`);
  console.log(`; Origin: ${target}   ← change with --target`);
  console.log(``);

  for (const domain of MINISTRY_DOMAINS) {
    console.log(`; ${domain.label}  (services/${domain.service})`);
    console.log(`${domain.slug}.${base}.\t${ttl}\tIN\tCNAME\t${target}.`);
    if (withAliases) {
      for (const alias of domain.aliases) {
        console.log(`${alias}.${base}.\t${ttl}\tIN\tCNAME\t${target}.`);
      }
    }
    console.log(``);
  }
  process.exit(0);
}

// --- live check -------------------------------------------------------------

if (has('check')) {
  const protocol = value('protocol') ?? 'https';
  console.log(`\n  Checking ${MINISTRY_DOMAINS.length} ministry hostnames on ${base}\n`);

  let ok = 0;
  for (const domain of MINISTRY_DOMAINS) {
    const url = `${protocol}://${domain.slug}.${base}/__platform/context`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const body = (await response.json()) as { ministry?: { service?: string } };
      const resolved = body.ministry?.service;
      const good = response.ok && resolved === domain.service;
      if (good) ok += 1;
      console.log(
        `  ${good ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${`${domain.slug}.${base}`.padEnd(38)} ` +
          `${response.status} → ${resolved ?? '(no ministry resolved)'}`,
      );
    } catch (error) {
      console.log(
        `  \x1b[31m✗\x1b[0m ${`${domain.slug}.${base}`.padEnd(38)} ` +
          `${error instanceof Error ? error.message : 'unreachable'}`,
      );
    }
  }
  console.log(`\n  ${ok}/${MINISTRY_DOMAINS.length} hostnames resolve to the right ministry.\n`);
  process.exit(ok === MINISTRY_DOMAINS.length ? 0 : 1);
}

// --- the table --------------------------------------------------------------

console.log(`\n  MINISTRY SUBDOMAINS — base domain: ${base}\n`);
console.log(`  ${'HOSTNAME'.padEnd(40)} ${'SERVICE'.padEnd(24)} MINISTRY`);
console.log(`  ${'-'.repeat(40)} ${'-'.repeat(24)} ${'-'.repeat(34)}`);

for (const domain of MINISTRY_DOMAINS) {
  const entry = SERVICE_DIRECTORY[domain.service as keyof typeof SERVICE_DIRECTORY];
  console.log(`  ${`${domain.slug}.${base}`.padEnd(40)} ${domain.service.padEnd(24)} ${domain.label}`);
  if (withAliases) {
    for (const alias of domain.aliases) {
      console.log(`  ${`  ↳ ${alias}.${base}`.padEnd(40)} ${''.padEnd(24)} alias — ${entry.name}`);
    }
  }
}

console.log(`\n  ${MINISTRY_DOMAINS.length} ministries.`);
if (!withAliases) {
  const aliases = MINISTRY_DOMAINS.reduce((total, d) => total + d.aliases.length, 0);
  console.log(`  ${aliases} alternative labels are also accepted — see them with: pnpm domains --aliases`);
}
console.log(`  Reserved (never routed to a ministry): ${RESERVED_LABELS.join(', ')}`);
console.log(`\n  DNS to create:      pnpm domains --zone > ministries.zone`);
console.log(`  Verify it is live:  pnpm domains --check\n`);
console.log(`  Locally, this already works with no DNS at all:`);
console.log(`      http://sante.localhost:${process.env.PLATFORM_PORT ?? 4000}`);
console.log(`      http://finances.localhost:${process.env.PLATFORM_PORT ?? 4000}\n`);
