/**
 * DOMAIN MODEL — Tunisia Digital Nervous System
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'sensors';
export const ENTITY_LABEL = 'Sensor';

export const Sensor = z.object({
  id: z.string(),
  label: z.string(),
  sensorKind: z.string(),
  governorate: z.string(),
  location: GeoLocation,
  unit: z.string(),
  mode: z.enum(['simulated', 'physical']),
  lastValue: z.number(),
  healthy: z.boolean(),
  synthetic: z.boolean().default(true),
});
export type Sensor = z.infer<typeof Sensor>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const SensorInput = Sensor.omit({ id: true, synthetic: true }).partial();
export type SensorInput = z.infer<typeof SensorInput>;

export const MODULES = [
  {
    id: 'tunisia-edge-ai-mesh',
    name: 'Tunisia Edge AI Mesh',
    purpose: 'Edge node health and locally-processed inference.',
  },
  {
    id: 'sovereign-iot-fabric',
    name: 'Sovereign IoT Fabric',
    purpose: 'Sensor registry and the single national ingest endpoint.',
  },
  {
    id: 'national-digital-identity-event-bus',
    name: 'National Digital Identity + Event Bus',
    purpose: 'Service registry, event catalogue, pseudonymous identity.',
  },
] as const;

export const PUBLISHES = [
  'iot.sensor.observation.v1',
  'dns.sensor.registered.v1',
  'dns.edge-node.status.v1',
  'dns.identity.verified.v1',
] as const;

export const CONSUMES = [
  'environment.air-quality.updated.v1',
  'emergency.incident.created.v1',
  'resilience.crisis.declared.v1',
  'resilience.mesh-node.status.v1',
  'infrastructure.asset-health.updated.v1',
  'energy.grid-load.updated.v1',
  'transport.resource.dispatched.v1',
  'water.reservoir-level.updated.v1',
  'health.capacity.updated.v1',
  'education.school-condition.updated.v1',
  'land.parcel.updated.v1',
  'research.finding.released.v1',
  'twin.anomaly.detected.v1',
  'treasury.funding.approved.v1',
  'tourism.site-pressure.detected.v1',
] as const;
