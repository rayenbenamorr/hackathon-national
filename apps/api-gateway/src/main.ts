/**
 * `pnpm dev` — the one command.
 *
 * Boots the event bus, all 24 ministry services and the gateway that fronts
 * them, then prints the three things a beginner needs: the address, the state
 * of the platform, and what to do next.
 */
import { bootPlatform, loadEnv } from '@platform/runtime';
import { createLogger } from '@platform/observability';
import { aiProvider } from '@platform/ai';
import { eventBus } from '@platform/events';
import { createGateway } from './server.ts';

loadEnv();

const log = createLogger({ service: 'platform' });
const port = Number(process.env.PLATFORM_PORT ?? 4000);

const only = process.env.PLATFORM_ONLY?.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const platform = await bootPlatform({ only });
const server = createGateway(platform);

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`
  Port ${port} is already in use.

  Either the platform is already running in another terminal (check
  http://localhost:${port}), or another program has the port. To use a
  different one:

      PLATFORM_PORT=4100 pnpm dev
`);
    process.exit(1);
  }
  throw error;
});

server.listen(port, () => {
  const failed = 24 - platform.ids.length;
  const bus = eventBus().stats();

  console.log(`
  ┌──────────────────────────────────────────────────────────────────────┐
  │  TUNISIA NATIONAL DIGITAL ECOSYSTEM — hackathon development platform │
  └──────────────────────────────────────────────────────────────────────┘

    Portal          http://localhost:${port}
    Observability   http://localhost:${port}/admin
    Services        ${platform.ids.length}/24 running${failed ? `   (${failed} failed — see the errors above)` : ''}
    Event bus       ${bus.transport}, ${bus.subscriptions} subscriptions
    AI              ${aiProvider().name}${aiProvider().mock ? ' (offline mock — no API key needed, nothing is billed)' : ` (${aiProvider().model} — real calls, real cost)`}
    Data            synthetic only, in .data/

    Try it:
      curl http://localhost:${port}/api/health/capacity
      curl http://localhost:${port}/__platform/graph
      pnpm simulate:sensor water-level

    Stop with Ctrl+C.
`);
  log.info('platform ready');
});

let stopping = false;
async function shutdown(signal: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  console.log(`\n  ${signal} — stopping the platform…`);
  server.close();
  await platform.stop();
  console.log('  Stopped. Your data is in .data/ and will be there next time.\n');
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  // A rejected promise in one ministry must never take the platform down (§28).
  log.error(`unhandled rejection: ${reason instanceof Error ? reason.message : String(reason)}`);
});
