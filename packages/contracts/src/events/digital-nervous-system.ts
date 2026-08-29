/**
 * EVENT CONTRACTS — Tunisia Digital Nervous System
 *
 * Adding an event: declare it here with defineEvent(), then add it to
 * tools/spec/services.part*.mjs and run `pnpm generate` so the manifest,
 * the docs and the architecture registry agree with the code.
 *
 * Changing an event: adding an OPTIONAL field is safe. Anything else needs a
 * new version (`.v2`) with the `.v1` contract kept until every consumer moved.
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';
import { defineEvent } from '../registry.ts';

/**
 * One sensor observation. The highest-volume event on the platform; ten ministries consume it.
 *
 * Owner: `digital-nervous-system` (Tunisia Digital Nervous System) — no other service may publish this.
 */
export const IotSensorObservationV1 = defineEvent({
  type: 'iot.sensor.observation.v1',
  owner: 'digital-nervous-system',
  summary: 'One sensor observation. The highest-volume event on the platform; ten ministries consume it.',
  tags: ['digital-nervous-system'],
  payload: z.object({
    observationId: z.string(),
    sensorId: z.string(),
    sensorKind: z.string(),
    value: z.number(),
    unit: z.string(),
    location: GeoLocation,
    governorate: z.string(),
    quality: z.enum(['good', 'degraded', 'suspect']),
    observedAt: z.string(),
  }),
  example: {
    observationId: 'observation_0001',
    sensorId: 'sensor_0001',
    sensorKind: 'sensorKind-sample',
    value: 42.5,
    unit: 'unit-sample',
    location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
    governorate: 'TN-11',
    quality: 'good',
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A new sensor joined the national fabric.
 *
 * Owner: `digital-nervous-system` (Tunisia Digital Nervous System) — no other service may publish this.
 */
export const DnsSensorRegisteredV1 = defineEvent({
  type: 'dns.sensor.registered.v1',
  owner: 'digital-nervous-system',
  summary: 'A new sensor joined the national fabric.',
  tags: ['digital-nervous-system'],
  payload: z.object({
    sensorId: z.string(),
    sensorKind: z.string(),
    governorate: z.string(),
    mode: z.enum(['simulated', 'physical']),
    ownerService: z.string(),
    registeredAt: z.string(),
  }),
  example: {
    sensorId: 'sensor_0001',
    sensorKind: 'sensorKind-sample',
    governorate: 'TN-11',
    mode: 'simulated',
    ownerService: 'ownerService-sample',
    registeredAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Edge node reachability and local inference load.
 *
 * Owner: `digital-nervous-system` (Tunisia Digital Nervous System) — no other service may publish this.
 */
export const DnsEdgeNodeStatusV1 = defineEvent({
  type: 'dns.edge-node.status.v1',
  owner: 'digital-nervous-system',
  summary: 'Edge node reachability and local inference load.',
  tags: ['digital-nervous-system'],
  payload: z.object({
    nodeId: z.string(),
    governorate: z.string(),
    online: z.boolean(),
    inferenceLoad: z.number().min(0).max(1),
    sensorsAttached: z.number().int(),
    observedAt: z.string(),
  }),
  example: {
    nodeId: 'node_0001',
    governorate: 'TN-11',
    online: true,
    inferenceLoad: 0.42,
    sensorsAttached: 12,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A pseudonymous identity assertion was verified.
 *
 * Owner: `digital-nervous-system` (Tunisia Digital Nervous System) — no other service may publish this.
 */
export const DnsIdentityVerifiedV1 = defineEvent({
  type: 'dns.identity.verified.v1',
  owner: 'digital-nervous-system',
  summary: 'A pseudonymous identity assertion was verified.',
  tags: ['digital-nervous-system'],
  payload: z.object({
    assertionId: z.string(),
    subjectPseudonym: z.string(),
    method: z.enum(['qr', 'nfc', 'otp', 'federated']),
    service: z.string(),
    verifiedAt: z.string(),
  }),
  example: {
    assertionId: 'assertion_0001',
    subjectPseudonym: 'subjectPseudonym-sample',
    method: 'qr',
    service: 'service-sample',
    verifiedAt: '2026-08-28T09:00:00.000Z',
  },
});
