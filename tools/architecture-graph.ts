/**
 * `pnpm architecture:graph` — the relation graph, in the terminal.
 *
 * The portal draws it; this prints it, so it can go in a report, a commit
 * message or a slide without a screenshot.
 */
import { ARCHITECTURE_RELATIONS, MINIMUM_PARTNERS, partnersOf, SERVICE_DIRECTORY } from '@platform/contracts';

const wantsMermaid = process.argv.includes('--mermaid');
const focus = process.argv.find((a) => !a.startsWith('-') && a in SERVICE_DIRECTORY);

if (wantsMermaid) {
  console.log('```mermaid');
  console.log('graph LR');
  const drawn = new Set<string>();
  for (const relation of ARCHITECTURE_RELATIONS) {
    if (focus && relation.source !== focus && relation.target !== focus) continue;
    const key = `${relation.source}->${relation.target}`;
    if (drawn.has(key)) continue;
    drawn.add(key);
    console.log(`  ${relation.source.replace(/-/g, '_')} --> ${relation.target.replace(/-/g, '_')}`);
  }
  console.log('```');
  process.exit(0);
}

const ids = Object.keys(SERVICE_DIRECTORY);

console.log(`\n  RELATION GRAPH — ${ids.length} ministries, ${ARCHITECTURE_RELATIONS.length} relations\n`);

for (const id of focus ? [focus] : ids) {
  const entry = SERVICE_DIRECTORY[id as keyof typeof SERVICE_DIRECTORY];
  const partners = partnersOf(id);
  const incoming = ARCHITECTURE_RELATIONS.filter((r) => r.target === id);
  const outgoing = ARCHITECTURE_RELATIONS.filter((r) => r.source === id);
  const flag = partners.length >= MINIMUM_PARTNERS ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';

  console.log(`  ${flag} ${id.padEnd(26)} ${entry.name}`);
  console.log(`      ${partners.length} partners · listens to ${incoming.length} · feeds ${outgoing.length}`);

  if (focus) {
    console.log('\n      LISTENS TO');
    for (const relation of incoming) {
      console.log(`        ← ${relation.source.padEnd(24)} ${relation.ref}`);
      console.log(
        `          ${relation.criticality === 'critical' ? '\x1b[33mcritical\x1b[0m ' : ''}${relation.reason}`,
      );
    }
    console.log('\n      FEEDS');
    for (const relation of outgoing) {
      console.log(`        → ${relation.target.padEnd(24)} ${relation.ref}`);
      console.log(
        `          ${relation.criticality === 'critical' ? '\x1b[33mcritical\x1b[0m ' : ''}${relation.reason}`,
      );
    }
  }
}

if (!focus) {
  console.log(`\n  One ministry in detail:  pnpm architecture:graph health`);
  console.log(`  Mermaid for a report:    pnpm architecture:graph --mermaid\n`);
}
