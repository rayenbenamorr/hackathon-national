import { MemoryAdapter, setStoreAdapter } from '@platform/data';
import { eventBus, type EventEnvelope } from '@platform/events';
import { eventContract } from '@platform/contracts';
import { serviceIdentity } from '@platform/auth';
import { newCorrelationId, newTraceId, resetObservability } from '@platform/observability';
import { bootPlatform, type Platform } from '@platform/runtime';

/**
 * TEST HARNESS
 *
 * `startTestPlatform()` gives a test the whole national platform in memory:
 * 24 services, the bus, the contracts, the twins — with the JSON store swapped
 * for an in-memory one so a test run never touches `.data/`.
 *
 * It is a PROCESS SINGLETON on purpose. Twenty-four test files each booting
 * twenty-four services would be 576 boots for no additional confidence; here it
 * is one, and `stop()` is a no-op that keeps every test file honest-looking.
 */
export interface TestResponse {
  status: number;
  body: unknown;
}

export interface TestPlatform {
  platform: Platform;
  get(service: string, path: string, query?: Record<string, string>): Promise<TestResponse>;
  post(service: string, path: string, body?: unknown): Promise<TestResponse>;
  /** Publish a producer's event using its own contract example. */
  publish(service: string, eventType: string, payload?: unknown): Promise<EventEnvelope>;
  /** Every delivery recorded for an event type since boot. */
  deliveriesOf(eventType: string): Array<{ from: string; to: string; ok: boolean }>;
  stop(): Promise<void>;
}

let shared: TestPlatform | null = null;
let booting: Promise<TestPlatform> | null = null;

export async function startTestPlatform(options: { only?: string[] } = {}): Promise<TestPlatform> {
  if (shared) return shared;
  if (booting) return booting;

  booting = (async () => {
    setStoreAdapter(new MemoryAdapter());
    resetObservability();

    const platform = await bootPlatform({ only: options.only, quiet: true });

    const call = async (
      service: string,
      method: 'GET' | 'POST',
      path: string,
      extra: Record<string, unknown>,
    ) => {
      const runtime = platform.runtimes.get(service);
      if (!runtime) {
        return {
          status: 503,
          body: { error: 'service_not_running', message: `${service} is not running in this test platform.` },
        };
      }
      return runtime.handle({
        method,
        path,
        identity: serviceIdentity('test'),
        trace: { traceId: newTraceId(), correlationId: newCorrelationId(), sourceService: 'test' },
        ...extra,
      } as never);
    };

    shared = {
      platform,
      get: (service, path, query) => call(service, 'GET', path, { query: query ?? {} }),
      post: (service, path, body) => call(service, 'POST', path, { body: body ?? {} }),

      async publish(service, eventType, payload) {
        const contract = eventContract(eventType);
        if (!contract) throw new Error(`No contract for "${eventType}" — declare it in packages/contracts.`);
        if (contract.owner !== service) {
          throw new Error(`"${eventType}" is owned by "${contract.owner}", not "${service}".`);
        }
        return eventBus().publish(eventType, service, payload ?? contract.example);
      },

      deliveriesOf: (eventType) =>
        eventBus()
          .recentDeliveries(500)
          .filter((delivery) => delivery.eventType === eventType)
          .map(({ from, to, ok }) => ({ from, to, ok })),

      // Intentionally a no-op: the platform is shared for the whole run and is
      // torn down when the process exits.
      async stop() {},
    };

    return shared;
  })();

  return booting;
}

/** Only the smoke runner needs this. */
export async function stopTestPlatform(): Promise<void> {
  if (!shared) return;
  await shared.platform.stop();
  shared = null;
  booting = null;
}
