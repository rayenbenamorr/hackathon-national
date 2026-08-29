/**
 * DOMAIN MODEL — Autonomous Mobility & Logistics Grid
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';
import { GeoLocation } from '@platform/refs';

export const COLLECTION = 'resources';
export const ENTITY_LABEL = 'Transport resource';

export const Resource = z.object({
  id: z.string(),
  label: z.string(),
  resourceType: z.enum(['ambulance', 'bus', 'truck', 'water-tanker', 'drone', 'boat', 'rail-unit']),
  governorate: z.string(),
  location: GeoLocation,
  status: z.enum(['available', 'engaged', 'maintenance', 'offline']),
  capacity: z.number(),
  operator: z.string(),
  etaMinutes: z.number().int(),
  synthetic: z.boolean().default(true),
});
export type Resource = z.infer<typeof Resource>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const ResourceInput = Resource.omit({ id: true, synthetic: true }).partial();
export type ResourceInput = z.infer<typeof ResourceInput>;

export const MODULES = [
  {
    id: 'national-mobility-digital-twin',
    name: 'National Mobility Digital Twin',
    purpose: 'Flows, congestion and demand by corridor.',
  },
  {
    id: 'v2x-smart-road-grid',
    name: 'V2X Smart Road Grid',
    purpose: 'Road-side signals and vehicle-to-infrastructure messages.',
  },
  {
    id: 'autonomous-logistics-brain',
    name: 'Autonomous Logistics Brain',
    purpose: 'Freight planning and resource dispatch.',
  },
] as const;

export const PUBLISHES = [
  'transport.mobility-demand.updated.v1',
  'transport.resource.dispatched.v1',
  'transport.congestion.detected.v1',
  'logistics.freight.updated.v1',
] as const;

export const CONSUMES = [
  'emergency.incident.created.v1',
  'emergency.resource.requested.v1',
  'health.emergency.declared.v1',
  'health.capacity.updated.v1',
  'resilience.resource-request.created.v1',
  'resilience.crisis.declared.v1',
  'environment.air-quality.updated.v1',
  'environment.climate-risk.updated.v1',
  'iot.sensor.observation.v1',
  'infrastructure.failure.predicted.v1',
  'infrastructure.maintenance.scheduled.v1',
  'trade.shipment.updated.v1',
  'culture.event.scheduled.v1',
  'tourism.visitor-flow.updated.v1',
  'education.school-condition.updated.v1',
  'agriculture.yield.forecast.v1',
] as const;
