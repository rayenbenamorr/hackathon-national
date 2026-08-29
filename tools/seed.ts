/**
 * `pnpm seed` — write the synthetic data without starting the server.
 *
 * Useful before a demo, or after `pnpm reset`, when you want the databases on
 * disk (and readable in an editor) before anything is running.
 */
import { loadEnv, bootPlatform } from '@platform/runtime';
import { inspectAllStores } from '@platform/data';

loadEnv();
process.env.IOT_SIMULATION_AUTOSTART = 'false';

console.log('\n  Seeding synthetic data for the 24 ministries…\n');

const platform = await bootPlatform({ quiet: true });
for (const runtime of platform.runtimes.values()) runtime.context.db.flush();
await platform.stop();

const stores = inspectAllStores();
let total = 0;
for (const [service, collections] of Object.entries(stores).sort()) {
  const rows = Object.values(collections).reduce((a, b) => a + b, 0);
  total += rows;
  console.log(
    `  ${service.padEnd(26)} ${String(rows).padStart(5)} rows   ${Object.keys(collections).join(', ')}`,
  );
}

console.log(`\n  ${total} synthetic rows across ${Object.keys(stores).length} service databases in .data/`);
console.log('  Every record is labelled `synthetic: true`. No real data is used anywhere (§25).\n');
process.exit(0);
