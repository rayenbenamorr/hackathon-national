import type { SensorObservation, SensorRef } from '@platform/refs';
import { GOVERNORATES, seededRandom, syntheticPointIn } from '@platform/geo';
import { newId } from '@platform/observability';
import { sensorKind, SENSOR_KINDS, type SensorKind } from './kinds.ts';

export interface SimulatedSensor extends SensorRef {
  kindSpec: SensorKind;
  /** Injected anomaly: while > 0 the sensor drifts, so anomaly detection has something to detect. */
  anomalyTicks: number;
  anomalyFactor: number;
}

export interface SimulatorOptions {
  /** Which kinds to simulate. Defaults to all of them. */
  kinds?: string[];
  /** Sensors per kind. */
  perKind?: number;
  seed?: string;
  ownerService?: string;
}

/**
 * The sensor simulator.
 *
 * Values follow `baseline + amplitude·sin(daily cycle) + noise`, clamped to the
 * physical range of the kind. Not a physics model — a plausible one. What it
 * buys is a platform where anomaly detection, forecasting and dashboards have
 * real moving data on day one, on a laptop, with no hardware in the room.
 *
 * `injectAnomaly()` exists because every team eventually wants to demo the
 * alert path, and waiting for a real outlier is not a demo.
 */
export class SensorSimulator {
  readonly sensors: SimulatedSensor[] = [];
  private tickCount = 0;
  private readonly rng: () => number;

  constructor(private readonly options: SimulatorOptions = {}) {
    this.rng = seededRandom(options.seed ?? 'tunisia-sensors-v1');
    this.build();
  }

  private build(): void {
    const kinds = (this.options.kinds ?? SENSOR_KINDS.map((k) => k.kind))
      .map((k) => sensorKind(k))
      .filter((k): k is SensorKind => Boolean(k));
    const perKind = this.options.perKind ?? 3;

    for (const spec of kinds) {
      for (let i = 0; i < perKind; i++) {
        const gov = GOVERNORATES[Math.floor(this.rng() * GOVERNORATES.length)];
        this.sensors.push({
          id: `sensor_${spec.kind}_${gov.code.toLowerCase().replace('tn-', '')}_${i + 1}`,
          label: `${spec.label} — ${gov.name} #${i + 1}`,
          sensorKind: spec.kind,
          unit: spec.unit,
          location: syntheticPointIn(gov.code, this.rng),
          ownerService: this.options.ownerService ?? 'digital-nervous-system',
          mode: 'simulated',
          synthetic: true,
          kindSpec: spec,
          anomalyTicks: 0,
          anomalyFactor: 1,
        });
      }
    }
  }

  /** One observation per sensor. */
  tick(at: Date = new Date()): SensorObservation[] {
    this.tickCount += 1;
    return this.sensors.map((sensor) => this.read(sensor, at));
  }

  read(sensor: SimulatedSensor, at: Date = new Date()): SensorObservation {
    const spec = sensor.kindSpec;
    const hours = at.getHours() + at.getMinutes() / 60;
    const cycle = spec.periodHours > 0 ? Math.sin((2 * Math.PI * hours) / spec.periodHours) : 0;
    const jitter = (this.rng() - 0.5) * 2 * spec.noise;

    let value = spec.baseline + spec.amplitude * cycle + jitter;

    if (sensor.anomalyTicks > 0) {
      sensor.anomalyTicks -= 1;
      value *= sensor.anomalyFactor;
    }

    value = Math.min(spec.max, Math.max(spec.min, value));

    return {
      observationId: newId('obs'),
      sensorId: sensor.id,
      sensorKind: sensor.sensorKind,
      value: Number(value.toFixed(spec.decimals)),
      unit: spec.unit,
      location: sensor.location,
      observedAt: at.toISOString(),
      quality: sensor.anomalyTicks > 0 ? 'suspect' : 'good',
      synthetic: true,
    };
  }

  /** Drive a sensor out of its normal band for N ticks — for demoing alerts. */
  injectAnomaly(sensorIdOrKind: string, factor = 2.2, ticks = 5): SimulatedSensor[] {
    const targets = this.sensors.filter((s) => s.id === sensorIdOrKind || s.sensorKind === sensorIdOrKind);
    for (const sensor of targets) {
      sensor.anomalyTicks = ticks;
      sensor.anomalyFactor = factor;
    }
    return targets;
  }

  byKind(kind: string): SimulatedSensor[] {
    return this.sensors.filter((s) => s.sensorKind === kind);
  }

  get ticks(): number {
    return this.tickCount;
  }
}
