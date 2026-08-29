/**
 * `pnpm export:interne` — hand the hierarchy to the employee workspace.
 *
 * The Tukhnanutha team runs this event from `/interne` in the corporate app,
 * which is a different repository with a different stack (Angular + Supabase).
 * It must not import from this one. So the architecture crosses the boundary
 * exactly once, here, as data:
 *
 *   tools/spec  →  pnpm export:interne  →  a SQL seed + a JSON snapshot
 *
 * Anything the workspace shows about a ministry — its pôle, its modules, its
 * events, how many ministries it is connected to, its subdomain — is generated
 * from the same source of truth that generates the services themselves. There
 * is no second list to keep in sync by hand.
 *
 *   pnpm export:interne                 JSON to stdout
 *   pnpm export:interne --sql           the seed INSERT statements
 *   pnpm export:interne --out <dir>     write both files
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  allEventContracts,
  ARCHITECTURE_RELATIONS,
  partnersOf,
  poleOf,
  POLES,
  SERVICE_DIRECTORY,
} from '@platform/contracts';
import { baseDomain, domainFor, loadEnv } from '@platform/runtime';
import { loadAllServices } from '../services/registry.ts';

loadEnv();

const argv = process.argv.slice(2);
const has = (flag: string) => argv.includes(`--${flag}`);
const value = (flag: string) => {
  const i = argv.indexOf(`--${flag}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

const definitions = await loadAllServices();
const base = baseDomain();

export interface MinistryExport {
  id: string;
  slug: string;
  pole: string;
  name: string;
  ministry: string;
  label_fr: string;
  summary: string;
  subdomain: string;
  modules: Array<{ id: string; name: string; purpose: string }>;
  publishes: string[];
  consumes: string[];
  routes: number;
  partners: number;
  critical_in: number;
  critical_out: number;
}

const ministries: MinistryExport[] = Object.values(SERVICE_DIRECTORY).map((entry) => {
  const definition = definitions.find((d) => d.id === entry.id)!;
  const domain = domainFor(entry.id)!;
  const pole = poleOf(entry.id)!;
  const relations = ARCHITECTURE_RELATIONS;

  return {
    id: entry.id,
    slug: domain.slug,
    pole: pole.id,
    name: entry.name,
    ministry: entry.ministry,
    label_fr: domain.label,
    summary: entry.description,
    subdomain: `${domain.slug}.${base}`,
    modules: definition.modules.map((m) => ({ id: m.id, name: m.name, purpose: m.purpose })),
    publishes: allEventContracts()
      .filter((c) => c.owner === entry.id)
      .map((c) => c.type),
    consumes: definition.consumers.map((c) => c.event),
    routes: definition.routes.length,
    partners: partnersOf(entry.id).length,
    critical_in: relations.filter((r) => r.target === entry.id && r.criticality === 'critical').length,
    critical_out: relations.filter((r) => r.source === entry.id && r.criticality === 'critical').length,
  };
});

const snapshot = {
  generated_from: 'hackathon-national/tools/spec',
  base_domain: base,
  poles: POLES.map((pole) => ({
    id: pole.id,
    name: pole.name,
    tagline: pole.tagline,
    colour: pole.colour,
    services: pole.services,
  })),
  ministries,
  relations: ARCHITECTURE_RELATIONS,
  totals: {
    poles: POLES.length,
    ministries: ministries.length,
    modules: ministries.reduce((total, m) => total + m.modules.length, 0),
    events: allEventContracts().length,
    relations: ARCHITECTURE_RELATIONS.length,
    routes: ministries.reduce((total, m) => total + m.routes, 0),
  },
};

// --- SQL --------------------------------------------------------------------

/**
 * The corporate workspace writes French WITHOUT diacritics — all 82 files of
 * `/interne`, labels and comments alike. It is a deliberate house convention.
 * So the seed is folded to ASCII: "Souverainete & Securite" sitting next to
 * the existing "Conges" and "Employes" reads as one product; the accented
 * version would read as a foreign module pasted in.
 */
const ascii = (raw: string) =>
  raw.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘]/g, "'").replace(/[“”]/g, '"');

const quote = (raw: string) => `'${ascii(raw).replace(/'/g, "''")}'`;
const jsonb = (raw: unknown) => `${quote(JSON.stringify(raw))}::jsonb`;

const MIGRATION_HEADER = `-- =====================================================================
--  HACKATHON — 02 : les donnees du programme
--  ${new Date().toISOString().slice(0, 10)}
--
--  A jouer APRES 2026-08-28-hackathon-01-programme.sql.
--
--  FICHIER GENERE. Ne pas modifier a la main.
--
--      cd hackathon-national && pnpm export:interne --migration
--
--  Il transporte, depuis hackathon-national/tools/spec, la seule chose que
--  l'espace employe a besoin de savoir sur la plateforme technique : la
--  hierarchie, et ce que chaque ministere publie, consomme et touche.
--
--  Tout est en \`on conflict do update\` : rejouer ce fichier apres une
--  evolution de la specification met les 24 lignes a jour sans rien perdre
--  des equipes ni des controles de deploiement, qui vivent dans d'autres
--  tables et ne sont jamais reecrits d'ici.
--
--  Le texte est volontairement sans accents : c'est la convention de tout
--  l'espace interne.
-- =====================================================================

begin;
`;
const textArray = (raw: string[]) => `array[${raw.map(quote).join(', ')}]::text[]`;

function sql(asMigration = false): string {
  const lines: string[] = [
    asMigration
      ? MIGRATION_HEADER
      : '-- GENERATED by hackathon-national: pnpm export:interne --sql\n-- Do not edit by hand.',
    `-- ${snapshot.totals.poles} poles · ${snapshot.totals.ministries} ministeres · ` +
      `${snapshot.totals.modules} modules · ${snapshot.totals.events} evenements · ` +
      `${snapshot.totals.relations} relations`,
    '',
    'insert into hackathon_poles (id, name, tagline, colour, position) values',
    POLES.map(
      (pole, i) =>
        `  (${quote(pole.id)}, ${quote(pole.name)}, ${quote(pole.tagline)}, ${quote(pole.colour)}, ${i + 1})`,
    ).join(',\n') +
      '\non conflict (id) do update set\n' +
      '  name = excluded.name, tagline = excluded.tagline, colour = excluded.colour, position = excluded.position;',
    '',
    'insert into hackathon_ministries',
    '  (id, slug, pole_id, name, ministry, label_fr, summary, subdomain, modules,',
    '   publishes, consumes, routes, partners, critical_in, critical_out) values',
    ministries
      .map(
        (m) =>
          `  (${quote(m.id)}, ${quote(m.slug)}, ${quote(m.pole)}, ${quote(m.name)}, ${quote(m.ministry)},\n` +
          `   ${quote(m.label_fr)}, ${quote(m.summary)}, ${quote(m.subdomain)}, ${jsonb(m.modules)},\n` +
          `   ${textArray(m.publishes)}, ${textArray(m.consumes)}, ${m.routes}, ${m.partners}, ${m.critical_in}, ${m.critical_out})`,
      )
      .join(',\n') +
      '\non conflict (id) do update set\n' +
      '  slug = excluded.slug, pole_id = excluded.pole_id, name = excluded.name,\n' +
      '  ministry = excluded.ministry, label_fr = excluded.label_fr, summary = excluded.summary,\n' +
      '  subdomain = excluded.subdomain, modules = excluded.modules,\n' +
      '  publishes = excluded.publishes, consumes = excluded.consumes, routes = excluded.routes,\n' +
      '  partners = excluded.partners, critical_in = excluded.critical_in, critical_out = excluded.critical_out;',
    '',
  ];

  if (asMigration) {
    // Every ministry gets its deployment row the moment it exists, so the
    // screen shows 24 lines "jamais controle" rather than an empty table that
    // looks like a bug.
    lines.push(
      'insert into hackathon_deployments (ministry_id, hostname)',
      'select id, subdomain from hackathon_ministries',
      'on conflict (ministry_id) do update set hostname = excluded.hostname;',
      '',
      'commit;',
      '',
    );
  }

  return lines.join('\n');
}

// --- output -----------------------------------------------------------------

const outDir = value('out');

if (outDir) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'hackathon-hierarchie.json'), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  writeFileSync(join(outDir, 'hackathon-seed.sql'), sql(), 'utf8');
  console.log(`\n  Written to ${outDir}:`);
  console.log(
    `    hackathon-hierarchie.json   ${snapshot.totals.ministries} ministries, ${snapshot.totals.relations} relations`,
  );
  console.log(
    `    hackathon-seed.sql          ${snapshot.totals.poles} pôles + ${snapshot.totals.ministries} ministères\n`,
  );
} else if (has('migration')) {
  console.log(sql(true));
} else if (has('sql')) {
  console.log(sql());
} else {
  console.log(JSON.stringify(snapshot, null, 2));
}

process.exit(0);
