/**
 * pnpm simulate:sensor <kind> [options]
 *
 * A device emulator, not a backdoor: it POSTs observations to the SAME public
 * ingest endpoint a real ESP32 would use. If the platform is not running it
 * says so in one sentence.
 *
 *   pnpm simulate:sensor water-level
 *   pnpm simulate:sensor traffic-flow --count 5 --interval 2000
 *   pnpm simulate:sensor air-quality --governorate TN-61 --anomaly
 *   pnpm simulate:sensor --list
 */
import { SENSOR_KINDS, sensorKind } from '../kinds.ts';
import { SensorSimulator } from '../simulator.ts';

const argv = process.argv.slice(2);
const VALUE_FLAGS = new Set(['count', 'interval', 'governorate']);

function flag(name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
}
function has(name: string): boolean {
  return argv.includes(`--${name}`);
}

/** First bare word that is not the value of a --flag. */
const positionals: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg.startsWith('--')) {
    if (VALUE_FLAGS.has(arg.slice(2))) i += 1;
    continue;
  }
  positionals.push(arg);
}
const kind = positionals[0];

if (has('list') || !kind) {
  console.log('\nAvailable sensor kinds:\n');
  for (const spec of SENSOR_KINDS) {
    console.log(`  ${spec.kind.padEnd(20)} ${spec.unit.padEnd(8)} ${spec.description}`);
    console.log(`  ${''.padEnd(20)} ${''.padEnd(8)} → ${spec.interestedServices.join(', ')}`);
  }
  console.log(
    '\nUsage:  pnpm simulate:sensor <kind> [--count 3] [--interval 5000] [--governorate TN-41] [--once] [--anomaly]\n',
  );
  process.exit(kind ? 0 : 1);
}

const spec = sensorKind(kind);
if (!spec) {
  console.error(`\n  Unknown sensor kind "${kind}".`);
  console.error(`  Run  pnpm simulate:sensor --list  to see the ${SENSOR_KINDS.length} available kinds.\n`);
  process.exit(1);
}

const port = process.env.PLATFORM_PORT ?? '4000';
const endpoint = `http://127.0.0.1:${port}/api/digital-nervous-system/sensors/observations`;

const count = Number(flag('count') ?? 3);
const interval = Number(flag('interval') ?? process.env.IOT_SIMULATION_INTERVAL_MS ?? 5000);
const once = has('once');

const simulator = new SensorSimulator({ kinds: [kind], perKind: count, seed: `cli:${kind}` });

const governorate = flag('governorate');
const sensors = governorate
  ? simulator.sensors.filter((s) => s.location.governorate === governorate)
  : simulator.sensors;

if (sensors.length === 0) {
  console.error(
    `\n  No simulated "${kind}" sensor landed in ${governorate}. Try without --governorate, or raise --count.\n`,
  );
  process.exit(1);
}

if (has('anomaly')) simulator.injectAnomaly(kind, 2.4, 6);

console.log(`\n  Simulating ${sensors.length} × ${spec.label} (${spec.unit})`);
console.log(`  → POST ${endpoint}`);
console.log(`  Ministries that will receive these observations: ${spec.interestedServices.join(', ')}`);
console.log(once ? '  Sending one batch.\n' : `  Every ${interval} ms. Ctrl+C to stop.\n`);

let sent = 0;
let warnedOffline = false;

async function pushOnce(): Promise<void> {
  const observations = sensors.map((sensor) => simulator.read(sensor));
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ observations }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(
        `  ! platform answered HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`,
      );
      return;
    }

    sent += observations.length;
    for (const observation of observations) {
      const flagged = observation.quality === 'suspect' ? '  [ANOMALY]' : '';
      console.log(
        `  ${observation.observedAt.slice(11, 19)}  ${observation.sensorId.padEnd(28)} ` +
          `${String(observation.value).padStart(8)} ${observation.unit}${flagged}`,
      );
    }
    warnedOffline = false;
  } catch {
    if (!warnedOffline) {
      console.error('\n  The platform is not answering on port ' + port + '.');
      console.error('  Start it in another terminal with:  pnpm dev\n');
      warnedOffline = true;
    }
  }
}

await pushOnce();

if (!once) {
  const timer = setInterval(() => void pushOnce(), interval);
  process.on('SIGINT', () => {
    clearInterval(timer);
    console.log(`\n  Stopped. ${sent} observations sent.\n`);
    process.exit(0);
  });
}
