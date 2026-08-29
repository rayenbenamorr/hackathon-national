/**
 * SYNTHETIC DATA — Tunisia Digital Nervous System
 *
 * The nervous system does not invent sensors: it registers the ones the
 * simulator declares, so that the registry and what actually emits observations
 * can never disagree. Every row is labelled `synthetic: true`.
 */
import { SensorSimulator } from '@platform/iot';
import type { ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Sensor } from './domain.ts';

export function seed(ctx: ServiceContext): void {
  const simulator = new SensorSimulator({ perKind: 2, seed: 'national-fabric-v1' });
  const sensors = ctx.db.collection<Sensor>(COLLECTION);

  for (const sensor of simulator.sensors) {
    sensors.upsert({
      id: sensor.id,
      label: sensor.label,
      sensorKind: sensor.sensorKind,
      governorate: sensor.location.governorate ?? 'TN-11',
      location: sensor.location,
      unit: sensor.unit,
      mode: 'simulated',
      lastValue: 0,
      healthy: true,
      synthetic: true,
    });
  }

  ctx.twins.upsert({
    id: 'twin_national_fabric',
    type: 'network',
    label: 'National sensor fabric',
    state: { sensors: simulator.sensors.length, status: 'nominal' },
  });

  ctx.log.info(`registered ${simulator.sensors.length} synthetic sensors`);
}

/** The same twin helpers every other ministry has, so routes read identically. */
export function twinIdFor(row: Sensor): string {
  return `twin_${row.id}`;
}

export function upsertTwin(ctx: ServiceContext, row: Sensor): void {
  ctx.twins.upsert({
    id: twinIdFor(row),
    type: 'network',
    label: row.label,
    location: row.location,
    state: { sensorKind: row.sensorKind, lastValue: row.lastValue, healthy: row.healthy, status: 'nominal' },
    attributes: { collection: COLLECTION, ownerService: ctx.id },
  });
}
