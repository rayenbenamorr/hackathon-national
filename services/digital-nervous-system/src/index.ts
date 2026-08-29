/**
 * Tunisia Digital Nervous System
 * Ministry: Digital Economy & Communication Technologies
 *
 * The backbone: sensor fabric, identity, service registry and the event bus itself.
 *
 * Be the layer nobody thinks about because it never fails: every sensor observation in the country enters here and reaches whichever ministries care, without any of them knowing the others exist.
 *
 * Read SERVICE_BRIEF.md before changing anything, and RELATIONS.md before
 * changing anything that other ministries depend on.
 */
import { defineService } from '@platform/service-kit';
import { MODULES } from './domain.ts';
import { routes } from './routes.ts';
import { consumers } from './consumers.ts';
import { seed } from './seed.ts';

let simulationTimer: NodeJS.Timeout | null = null;
let tick = 0;

export default defineService({
  id: 'digital-nervous-system',
  name: 'Tunisia Digital Nervous System',
  description: 'The backbone: sensor fabric, identity, service registry and the event bus itself.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
  async onStart(ctx) {
    // The fabric produces observations on its own, so the platform has moving
    // data the moment it starts. Turn it off with IOT_SIMULATION_AUTOSTART=false.
    if (process.env.IOT_SIMULATION_AUTOSTART === 'false') {
      ctx.log.info('sensor simulation disabled (IOT_SIMULATION_AUTOSTART=false)');
      return;
    }

    const { SensorSimulator } = await import('@platform/iot');
    const simulator = new SensorSimulator({ perKind: 2, seed: 'national-fabric-v1' });
    const intervalMs = Number(process.env.IOT_SIMULATION_INTERVAL_MS ?? 8000);

    const timer = setInterval(() => {
      void (async () => {
        // One kind per tick, round-robin: informative without flooding the bus.
        const kinds = [...new Set(simulator.sensors.map((s) => s.sensorKind))];
        const kind = kinds[tick % kinds.length];
        tick += 1;

        for (const sensor of simulator.byKind(kind)) {
          const observation = simulator.read(sensor);
          try {
            await ctx.publish('iot.sensor.observation.v1', {
              observationId: observation.observationId,
              sensorId: observation.sensorId,
              sensorKind: observation.sensorKind,
              value: observation.value,
              unit: observation.unit,
              location: observation.location,
              governorate: observation.location.governorate ?? 'TN-11',
              quality: observation.quality,
              observedAt: observation.observedAt,
            });
          } catch (error) {
            ctx.log.warn(`simulated observation rejected: ${error instanceof Error ? error.message : error}`);
          }
        }
      })();
    }, intervalMs);
    timer.unref?.();
    simulationTimer = timer;

    ctx.log.info(
      `sensor simulation running every ${intervalMs} ms across ${simulator.sensors.length} sensors`,
    );
  },

  onStop() {
    if (simulationTimer) clearInterval(simulationTimer);
    simulationTimer = null;
  },
});
