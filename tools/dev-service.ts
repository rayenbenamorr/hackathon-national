/**
 * `pnpm dev:service <id> [<id> …]`
 *
 * Runs ONE ministry (or a few) behind the same gateway, on the same port. The
 * other 23 are simply absent — which is the point: this is how a team sees what
 * their service does when its neighbours are down, and confirms that the answer
 * is a readable "X integration is unavailable" and not a stack trace (§28).
 */
import { SERVICE_IDS } from '../services/registry.ts';

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));

if (requested.length === 0) {
  console.log(`
  Usage:  pnpm dev:service <service-id> [more ids…]

  Example:
      pnpm dev:service health
      pnpm dev:service health mobility-logistics

  The 24 ministry services:
${SERVICE_IDS.map((id) => `      ${id}`).join('\n')}

  Running them all is just:  pnpm dev
`);
  process.exit(1);
}

const unknown = requested.filter((id) => !SERVICE_IDS.includes(id));
if (unknown.length) {
  console.error(`
  Unknown service id: ${unknown.join(', ')}

  Did you mean one of these?
${
  SERVICE_IDS.filter((id) => unknown.some((u) => id.includes(u.slice(0, 4))))
    .map((id) => `      ${id}`)
    .join('\n') || '      (run `pnpm dev:service` with no argument to see all 24)'
}
`);
  process.exit(1);
}

process.env.PLATFORM_ONLY = requested.join(',');

console.log(`
  Starting ${requested.length} of 24 ministry services: ${requested.join(', ')}

  The others are NOT running. Calls to them will return a readable
  "…​ integration is unavailable" instead of failing — check it with:
      curl http://localhost:${process.env.PLATFORM_PORT ?? 4000}/api/${requested[0]}/dependencies
`);

await import('../apps/api-gateway/src/main.ts');
