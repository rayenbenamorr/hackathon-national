import { describe, expect, it } from 'vitest';
import {
  SENSOR_KINDS,
  SensorSimulator,
  sensorKind,
  registerDeviceAdapter,
  HttpIngestAdapter,
  deviceAdapter,
} from '@platform/iot';
import { SensorObservation } from '@platform/refs';
import { inTunisia } from '@platform/geo';

describe('IoT foundation', () => {
  it('covers the sensor families the brief asks for (§14)', () => {
    const kinds = SENSOR_KINDS.map((k) => k.kind);
    for (const required of [
      'temperature',
      'water-level',
      'humidity',
      'air-quality',
      'traffic-flow',
      'energy-load',
      'gps-position',
      'soil-moisture',
      'occupancy',
      'vibration',
      'wearable-heartrate',
    ]) {
      expect(kinds, `missing sensor kind ${required}`).toContain(required);
    }
  });

  it('names, for each kind, the ministries it concerns', () => {
    for (const kind of SENSOR_KINDS) {
      expect(kind.interestedServices.length, `${kind.kind} interests nobody`).toBeGreaterThan(0);
      expect(kind.unit).toBeTruthy();
    }
  });

  it('emits observations that satisfy the shared contract', () => {
    const simulator = new SensorSimulator({
      kinds: ['water-level', 'air-quality'],
      perKind: 2,
      seed: 'test',
    });
    for (const observation of simulator.tick()) {
      const parsed = SensorObservation.safeParse(observation);
      expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
      expect(observation.synthetic).toBe(true);
      expect(inTunisia(observation.location)).toBe(true);
    }
  });

  it('stays inside the physical range of its kind', () => {
    const spec = sensorKind('air-quality')!;
    const simulator = new SensorSimulator({ kinds: ['air-quality'], perKind: 3, seed: 'range' });
    for (let i = 0; i < 40; i++) {
      for (const observation of simulator.tick()) {
        expect(observation.value).toBeGreaterThanOrEqual(spec.min);
        expect(observation.value).toBeLessThanOrEqual(spec.max);
      }
    }
  });

  it('can be pushed out of band on demand, so alerts are demonstrable', () => {
    const simulator = new SensorSimulator({ kinds: ['water-level'], perKind: 1, seed: 'anomaly' });
    const affected = simulator.injectAnomaly('water-level', 2.5, 3);
    expect(affected).toHaveLength(1);
    expect(simulator.tick()[0].quality).toBe('suspect');
  });

  it('is deterministic, so the same sensor sits at the same place everywhere', () => {
    const a = new SensorSimulator({ kinds: ['soil-moisture'], perKind: 2, seed: 'fixed' });
    const b = new SensorSimulator({ kinds: ['soil-moisture'], perKind: 2, seed: 'fixed' });
    expect(a.sensors.map((s) => s.id)).toEqual(b.sensors.map((s) => s.id));
    expect(a.sensors[0].location).toEqual(b.sensors[0].location);
  });

  it('has a seam for real hardware', () => {
    const adapter = new HttpIngestAdapter();
    let received = 0;
    adapter.onObservation(() => (received += 1));
    registerDeviceAdapter(adapter);

    expect(deviceAdapter('http-ingest')).toBe(adapter);
    adapter.ingest({
      observationId: 'obs',
      sensorId: 's',
      sensorKind: 'temperature',
      value: 21,
      unit: '°C',
      location: { lat: 36.8, lon: 10.1 },
      observedAt: new Date().toISOString(),
      quality: 'good',
      synthetic: true,
    });
    expect(received).toBe(1);
  });
});
