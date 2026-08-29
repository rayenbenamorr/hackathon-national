/**
 * EVENT CONTRACTS — National Safety & Emergency Grid
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
 * An incident was reported. The most widely consumed event on the platform.
 *
 * Owner: `safety-emergency` (National Safety & Emergency Grid) — no other service may publish this.
 */
export const EmergencyIncidentCreatedV1 = defineEvent({
  type: 'emergency.incident.created.v1',
  owner: 'safety-emergency',
  summary: 'An incident was reported. The most widely consumed event on the platform.',
  tags: ['safety-emergency'],
  payload: z.object({
    incidentId: z.string(),
    incidentType: z.string(),
    severity: z.string(),
    location: GeoLocation,
    governorate: z.string(),
    casualties: z.number().int(),
    declaredAt: z.string(),
  }),
  example: {
    incidentId: 'incident_0001',
    incidentType: 'incidentType-sample',
    severity: 'severity-sample',
    location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
    governorate: 'TN-11',
    casualties: 12,
    declaredAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * An incident is closed, with how long it took.
 *
 * Owner: `safety-emergency` (National Safety & Emergency Grid) — no other service may publish this.
 */
export const EmergencyIncidentResolvedV1 = defineEvent({
  type: 'emergency.incident.resolved.v1',
  owner: 'safety-emergency',
  summary: 'An incident is closed, with how long it took.',
  tags: ['safety-emergency'],
  payload: z.object({
    incidentId: z.string(),
    incidentType: z.string(),
    governorate: z.string(),
    durationMinutes: z.number().int(),
    resolvedAt: z.string(),
  }),
  example: {
    incidentId: 'incident_0001',
    incidentType: 'incidentType-sample',
    governorate: 'TN-11',
    durationMinutes: 12,
    resolvedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Emergency asks another ministry for a specific resource.
 *
 * Owner: `safety-emergency` (National Safety & Emergency Grid) — no other service may publish this.
 */
export const EmergencyResourceRequestedV1 = defineEvent({
  type: 'emergency.resource.requested.v1',
  owner: 'safety-emergency',
  summary: 'Emergency asks another ministry for a specific resource.',
  tags: ['safety-emergency'],
  payload: z.object({
    requestId: z.string(),
    incidentId: z.string(),
    resourceType: z.string(),
    location: GeoLocation,
    urgency: z.enum(['normal', 'high', 'critical']),
    requestedAt: z.string(),
  }),
  example: {
    requestId: 'request_0001',
    incidentId: 'incident_0001',
    resourceType: 'resourceType-sample',
    location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
    urgency: 'normal',
    requestedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Risk score for a road segment changed.
 *
 * Owner: `safety-emergency` (National Safety & Emergency Grid) — no other service may publish this.
 */
export const EmergencyRoadRiskUpdatedV1 = defineEvent({
  type: 'emergency.road-risk.updated.v1',
  owner: 'safety-emergency',
  summary: 'Risk score for a road segment changed.',
  tags: ['safety-emergency'],
  payload: z.object({
    segmentId: z.string(),
    governorate: z.string(),
    riskScore: z.number().min(0).max(1),
    drivers: z.array(z.string()),
    observedAt: z.string(),
  }),
  example: {
    segmentId: 'segment_0001',
    governorate: 'TN-11',
    riskScore: 0.42,
    drivers: ['drought-index', 'sensor-observations'],
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});
