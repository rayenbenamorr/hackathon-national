/**
 * `pnpm smoke` — the global integration test (§22, §32).
 *
 * Boots the whole platform in memory and walks the paths a student actually
 * depends on: every ministry answers, a cross-ministry call resolves, an AI
 * route produces a contract-valid event, that event reaches its declared
 * consumers, a sensor observation crosses the country, and a missing dependency
 * degrades into a sentence rather than a crash.
 */
import { setStoreAdapter, MemoryAdapter } from '@platform/data';
import { eventBus } from '@platform/events';
import { loadEnv, bootPlatform } from '@platform/runtime';
import { ARCHITECTURE_RELATIONS, SERVICE_DIRECTORY } from '@platform/contracts';
import { serviceIdentity } from '@platform/auth';
import { newCorrelationId, newTraceId, flow } from '@platform/observability';
import { createPlatformClient } from '@platform/sdk';

loadEnv();
setStoreAdapter(new MemoryAdapter());

const results: Array<{ name: string; ok: boolean; detail: string }> = [];
const check = (name: string, ok: boolean, detail = '') => results.push({ name, ok, detail });

const trace = () => ({ traceId: newTraceId(), correlationId: newCorrelationId(), sourceService: 'smoke' });

console.log('\n  GLOBAL SMOKE TEST\n');
const platform = await bootPlatform({ quiet: true });

// 1 — every ministry is up ---------------------------------------------------
check('24 ministry services boot', platform.ids.length === 24, `${platform.ids.length}/24 running`);

// 2 — every ministry answers /health ----------------------------------------
const unhealthy: string[] = [];
for (const [id, runtime] of platform.runtimes) {
  const response = await runtime.handle({ method: 'GET', path: '/health', trace: trace() });
  if (response.status !== 200) unhealthy.push(id);
}
check('every service answers GET /health', unhealthy.length === 0, unhealthy.join(', '));

// 3 — every ministry has seeded synthetic data -------------------------------
const empty: string[] = [];
for (const [id, runtime] of platform.runtimes) {
  const stats = runtime.context.db.stats();
  if (Object.values(stats).reduce((a, b) => a + b, 0) === 0) empty.push(id);
}
check('every service seeded synthetic data', empty.length === 0, empty.join(', '));

// 4 — a cross-ministry synchronous call resolves ------------------------------
const client = createPlatformClient('smoke');
const nearest = await client.tryCall<{ items: unknown[] }>('mobility-logistics', 'GET /resources/nearest', {
  query: { lat: 36.8, lon: 10.18, resourceType: 'ambulance' },
});
check(
  'cross-ministry API call (→ mobility-logistics)',
  nearest.ok && Array.isArray(nearest.data.items) && nearest.data.items.length > 0,
  nearest.ok ? `${nearest.data.items.length} resources found` : nearest.reason,
);

// 5 — an AI route produces a contract-valid event, offline --------------------
const foodWater = platform.runtimes.get('food-water')!;
const forecast = await foodWater.handle({
  method: 'POST',
  path: '/water/shortage/predict',
  body: { governorate: 'TN-41', horizonDays: 7 },
  identity: serviceIdentity('smoke'),
  trace: trace(),
});
const forecastBody = forecast.body as { data?: { governorate?: string }; mock?: boolean };
check(
  'AI route works with no API key and honours its input',
  forecast.status === 200 && forecastBody.data?.governorate === 'TN-41',
  forecast.status === 200 ? `mock=${forecastBody.mock}` : JSON.stringify(forecast.body).slice(0, 160),
);

// 6 — that event reached every declared consumer ------------------------------
const declaredConsumers = ARCHITECTURE_RELATIONS.filter(
  (r) => r.kind === 'event' && r.ref === 'agriculture.water-shortage.predicted.v1',
).map((r) => r.target);
const delivered = eventBus()
  .recentDeliveries(500)
  .filter((d) => d.eventType === 'agriculture.water-shortage.predicted.v1' && d.ok)
  .map((d) => d.to);
const missed = declaredConsumers.filter((id) => !delivered.includes(id));
check(
  `water-shortage event reached its ${declaredConsumers.length} declared consumers`,
  missed.length === 0,
  missed.length ? `missed: ${missed.join(', ')}` : declaredConsumers.join(', '),
);

// 7 — the signal is readable from a consumer's own API ------------------------
const treasury = platform.runtimes.get('treasury')!;
const signals = await treasury.handle({
  method: 'GET',
  path: '/signals',
  query: { eventType: 'agriculture.water-shortage.predicted.v1' },
  trace: trace(),
});
const signalItems = (signals.body as { items: unknown[] }).items;
check(
  'a consumer can read the signal it received',
  signalItems.length > 0,
  `${signalItems.length} signal(s) in treasury`,
);

// 8 — sensor ingest crosses the country --------------------------------------
const dns = platform.runtimes.get('digital-nervous-system')!;
const ingest = await dns.handle({
  method: 'POST',
  path: '/sensors/observations',
  body: {
    observations: [
      {
        observationId: 'obs_smoke_0001',
        sensorId: 'sensor_smoke_water',
        sensorKind: 'water-level',
        value: 4.2,
        unit: 'm',
        location: { lat: 35.67, lon: 10.1, governorate: 'TN-41' },
        observedAt: new Date().toISOString(),
        quality: 'good',
        synthetic: true,
      },
    ],
  },
  identity: serviceIdentity('smoke'),
  trace: trace(),
});
const observationConsumers = eventBus()
  .recentDeliveries(500)
  .filter((d) => d.eventType === 'iot.sensor.observation.v1' && d.ok).length;
check(
  'a sensor observation reaches the ministries that care',
  ingest.status === 200 && observationConsumers > 5,
  `${observationConsumers} deliveries`,
);

// 9 — twins moved from that one observation, across ministries ----------------
const touched: string[] = [];
for (const [id, runtime] of platform.runtimes) {
  const updated = runtime.context.twins.list({ limit: 500 }).filter((twin) => twin.observations.length > 0);
  if (updated.length) touched.push(`${id}(${updated.length})`);
}
check(
  'one sensor observation updates twins in several ministries',
  touched.length >= 3,
  touched.join(' ') || 'no twin carries an observation',
);

// 10 — a missing dependency degrades into a sentence --------------------------
const offline = createPlatformClient('smoke');
const missing = await offline.tryCall('this-ministry-does-not-exist', 'GET /whatever');
check(
  'a missing dependency degrades readably (§28)',
  !missing.ok && !/ECONNREFUSED|ETIMEDOUT|undefined/.test(missing.reason),
  missing.ok ? '' : missing.reason.slice(0, 120),
);

// 11 — an event that breaks its contract is refused, loudly -------------------
let refused = false;
let refusalMessage = '';
try {
  await eventBus().publish('health.capacity.updated.v1', 'health', { nonsense: true });
} catch (error) {
  refused = true;
  refusalMessage = error instanceof Error ? error.message : String(error);
}
check('the bus refuses an event that breaks its contract', refused, refusalMessage.slice(0, 120));

// 12 — a service may not publish an event it does not own ---------------------
let blocked = false;
try {
  await platform.runtimes.get('tourism')!.context.publish('health.capacity.updated.v1', {});
} catch (error) {
  blocked = /owned by/.test(error instanceof Error ? error.message : '');
}
check('a service cannot publish another ministry event', blocked);

// 13 — the trace tells the story ---------------------------------------------
const storyTrace = eventBus()
  .recentEvents(50)
  .find((e) => e.eventType === 'agriculture.water-shortage.predicted.v1');
const story = storyTrace ? flow(storyTrace.traceId) : null;
check(
  'the platform can draw the chain it just executed',
  Boolean(story && story.children.length > 0),
  story
    ? `${story.service} → ${story.children
        .map((c) => c.service)
        .slice(0, 5)
        .join(', ')}…`
    : 'no trace',
);

await platform.stop();

// --- report -----------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
for (const result of results) {
  console.log(
    `  ${result.ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${result.name}${result.detail ? `\n      ${result.detail}` : ''}`,
  );
}
console.log(
  `\n  ${results.length - failed.length}/${results.length} checks passed across ${Object.keys(SERVICE_DIRECTORY).length} ministries.\n`,
);
process.exit(failed.length === 0 ? 0 : 1);
