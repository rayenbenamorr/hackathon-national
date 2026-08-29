/**
 * `pnpm reset` — throw away local data and start again.
 *
 * Deletes `.data/`. Nothing else: source code, your service, your commits are
 * untouched. On the next `pnpm dev` every ministry re-seeds its synthetic
 * records from the same seed, so the platform comes back identical.
 */
import { JsonFileAdapter, inspectAllStores } from '@platform/data';
import { loadEnv } from '@platform/runtime';

loadEnv();

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const before = inspectAllStores();
const adapter = new JsonFileAdapter();

if (only.length) {
  for (const id of only) {
    adapter.reset(id);
    console.log(`  cleared ${id} (${Object.values(before[id] ?? {}).reduce((a, b) => a + b, 0)} rows)`);
  }
} else {
  const total = Object.values(before).reduce(
    (sum, collections) => sum + Object.values(collections).reduce((a, b) => a + b, 0),
    0,
  );
  adapter.reset();
  console.log(`  cleared ${Object.keys(before).length} service databases (${total} rows)`);
}

console.log(`\n  Run \`pnpm dev\` to re-seed. Your code was not touched.\n`);
