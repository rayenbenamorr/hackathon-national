import { eventBus } from '@platform/events';
import { createLogger } from '@platform/observability';
import { createServiceRuntime, type ServiceRuntime } from '@platform/service-kit';
import { unregisterServiceEndpoint } from '@platform/sdk';
// Importing the contracts barrel is what registers all 84 event contracts and
// installs the bus validator. It must happen before any service starts.
import '@platform/contracts';
import { loadService, SERVICE_IDS } from '../../../services/registry.ts';

export { loadEnv } from './env.ts';
export * from './domains.ts';

const log = createLogger({ service: 'platform' });

export interface Platform {
  runtimes: Map<string, ServiceRuntime>;
  ids: string[];
  stop(): Promise<void>;
}

export interface BootOptions {
  /** Which ministries to host. Defaults to all 24. */
  only?: string[];
  quiet?: boolean;
}

/**
 * BOOT THE NATIONAL PLATFORM.
 *
 * All 24 ministries run in ONE Node process by default (ADR-0004). The service
 * boundaries are logical and enforced in code — separate databases, no shared
 * imports, communication only through the gateway and the bus — while the
 * OPERATIONAL cost stays at one command and one port. §7 of the brief: real
 * boundaries, no microservice chaos.
 */
export async function bootPlatform(options: BootOptions = {}): Promise<Platform> {
  const ids = options.only?.length ? options.only : SERVICE_IDS;

  const unknown = ids.filter((id) => !SERVICE_IDS.includes(id));
  if (unknown.length) {
    throw new Error(
      `Unknown service id(s): ${unknown.join(', ')}.\nThe 24 ids are:\n  ${SERVICE_IDS.join('\n  ')}`,
    );
  }

  await eventBus().start();

  const runtimes = new Map<string, ServiceRuntime>();
  const failures: Array<{ id: string; error: string }> = [];

  for (const id of ids) {
    try {
      const definition = await loadService(id);
      const runtime = createServiceRuntime(definition);
      await runtime.start();
      runtimes.set(id, runtime);
    } catch (error) {
      // §28: one broken ministry must not stop the other 23 from starting.
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ id, error: message });
      log.error(`service "${id}" failed to start: ${message}`);
    }
  }

  if (!options.quiet) {
    log.info(
      `${runtimes.size}/${ids.length} ministry services running on the ${eventBus().transportName} bus`,
    );
    if (failures.length) {
      log.warn(`${failures.length} service(s) did NOT start: ${failures.map((f) => f.id).join(', ')}`);
    }
  }

  return {
    runtimes,
    ids: [...runtimes.keys()],
    async stop() {
      for (const [id, runtime] of runtimes) {
        await runtime.stop();
        unregisterServiceEndpoint(id);
      }
      runtimes.clear();
      await eventBus().stop();
    },
  };
}

export { SERVICE_IDS };
