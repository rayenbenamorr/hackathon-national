import type { SensorObservation } from '@platform/refs';

/**
 * REAL DEVICES (§14).
 *
 * No hardware is required during the hackathon — and none is emulated in
 * pretend. What exists is the seam: a real ESP32, a LoRa gateway or an MQTT
 * broker becomes a source of platform events by implementing three methods.
 * Nothing above this interface knows whether an observation was measured or
 * simulated, except the `mode` field on the sensor, which is never lost.
 */
export interface DeviceAdapter {
  readonly name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onObservation(handler: (observation: SensorObservation) => void): void;
}

/**
 * The adapter that actually ships: devices POST to the platform.
 *
 *   POST /api/digital-nervous-system/sensors/observations
 *
 * Any board with an HTTP client — ESP32, Raspberry Pi, a phone, `curl` — is a
 * first-class sensor with no driver to write. `packages/iot/src/cli/simulate.ts`
 * is itself just a client of this endpoint, so the simulated and the real path
 * are the same path.
 */
export class HttpIngestAdapter implements DeviceAdapter {
  readonly name = 'http-ingest';
  private handler: ((observation: SensorObservation) => void) | null = null;

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {
    this.handler = null;
  }

  onObservation(handler: (observation: SensorObservation) => void): void {
    this.handler = handler;
  }

  /** Called by the ingest route once the body has been validated. */
  ingest(observation: SensorObservation): void {
    this.handler?.(observation);
  }
}

/**
 * MQTT sketch — intentionally not implemented.
 *
 * Written out so a team that brings a real broker knows exactly where their
 * twenty lines go, and so that nobody adds an MQTT dependency to a platform
 * that 1 500 people install on the first morning.
 */
export class MqttAdapterNotConfigured implements DeviceAdapter {
  readonly name = 'mqtt';
  async connect(): Promise<void> {
    throw new Error(
      'The MQTT adapter is a seam, not an implementation. To use a real broker: ' +
        '`pnpm add mqtt`, implement connect/onObservation here, and register it with registerDeviceAdapter(). ' +
        'Everything downstream already works.',
    );
  }
  async disconnect(): Promise<void> {}
  onObservation(): void {}
}

const adapters = new Map<string, DeviceAdapter>();

export function registerDeviceAdapter(adapter: DeviceAdapter): void {
  adapters.set(adapter.name, adapter);
}

export function deviceAdapter(name: string): DeviceAdapter | undefined {
  return adapters.get(name);
}

export function registeredAdapters(): string[] {
  return [...adapters.keys()];
}
