/**
 * EVENT CONTRACTS — Autonomous Mobility & Logistics Grid
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
 * Demand and congestion on a corridor.
 *
 * Owner: `mobility-logistics` (Autonomous Mobility & Logistics Grid) — no other service may publish this.
 */
export const TransportMobilityDemandUpdatedV1 = defineEvent({
  type: 'transport.mobility-demand.updated.v1',
  owner: 'mobility-logistics',
  summary: 'Demand and congestion on a corridor.',
  tags: ['mobility-logistics'],
  payload: z.object({
    corridorId: z.string(),
    governorate: z.string(),
    demandIndex: z.number().min(0).max(1),
    congestionIndex: z.number().min(0).max(1),
    mode: z.string(),
    observedAt: z.string(),
  }),
  example: {
    corridorId: 'corridor_0001',
    governorate: 'TN-11',
    demandIndex: 0.42,
    congestionIndex: 0.42,
    mode: 'mode-sample',
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A resource was assigned to a request from another ministry.
 *
 * Owner: `mobility-logistics` (Autonomous Mobility & Logistics Grid) — no other service may publish this.
 */
export const TransportResourceDispatchedV1 = defineEvent({
  type: 'transport.resource.dispatched.v1',
  owner: 'mobility-logistics',
  summary: 'A resource was assigned to a request from another ministry.',
  tags: ['mobility-logistics'],
  payload: z.object({
    dispatchId: z.string(),
    resourceId: z.string(),
    resourceType: z.string(),
    requestedBy: z.string(),
    destination: GeoLocation,
    etaMinutes: z.number().int(),
    dispatchedAt: z.string(),
  }),
  example: {
    dispatchId: 'dispatch_0001',
    resourceId: 'resource_0001',
    resourceType: 'resourceType-sample',
    requestedBy: 'requestedBy-sample',
    destination: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
    etaMinutes: 12,
    dispatchedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Congestion crossed a threshold on a corridor.
 *
 * Owner: `mobility-logistics` (Autonomous Mobility & Logistics Grid) — no other service may publish this.
 */
export const TransportCongestionDetectedV1 = defineEvent({
  type: 'transport.congestion.detected.v1',
  owner: 'mobility-logistics',
  summary: 'Congestion crossed a threshold on a corridor.',
  tags: ['mobility-logistics'],
  payload: z.object({
    corridorId: z.string(),
    governorate: z.string(),
    congestionIndex: z.number().min(0).max(1),
    cause: z.string(),
    detectedAt: z.string(),
  }),
  example: {
    corridorId: 'corridor_0001',
    governorate: 'TN-11',
    congestionIndex: 0.42,
    cause: 'cause-sample',
    detectedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A freight movement changed state.
 *
 * Owner: `mobility-logistics` (Autonomous Mobility & Logistics Grid) — no other service may publish this.
 */
export const LogisticsFreightUpdatedV1 = defineEvent({
  type: 'logistics.freight.updated.v1',
  owner: 'mobility-logistics',
  summary: 'A freight movement changed state.',
  tags: ['mobility-logistics'],
  payload: z.object({
    orderId: z.string(),
    originGovernorate: z.string(),
    destinationGovernorate: z.string(),
    tonnes: z.number(),
    status: z.enum(['planned', 'loading', 'moving', 'delivered', 'blocked']),
    updatedAt: z.string(),
  }),
  example: {
    orderId: 'order_0001',
    originGovernorate: 'TN-11',
    destinationGovernorate: 'TN-11',
    tonnes: 42.5,
    status: 'planned',
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});
