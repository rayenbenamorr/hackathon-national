/**
 * EVENT CONTRACTS — National Resilience Command System
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
 * A crisis is declared — the single signal that reconfigures the whole platform.
 *
 * Owner: `resilience` (National Resilience Command System) — no other service may publish this.
 */
export const ResilienceCrisisDeclaredV1 = defineEvent({
  type: 'resilience.crisis.declared.v1',
  owner: 'resilience',
  summary: 'A crisis is declared — the single signal that reconfigures the whole platform.',
  tags: ['resilience'],
  payload: z.object({
    crisisId: z.string(),
    kind: z.string(),
    severity: z.string(),
    governorate: z.string(),
    location: GeoLocation,
    affectedPeople: z.number().int(),
    declaredAt: z.string(),
  }),
  example: {
    crisisId: 'crisi_0001',
    kind: 'kind-sample',
    severity: 'severity-sample',
    governorate: 'TN-11',
    location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
    affectedPeople: 12,
    declaredAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * The resourced relief plan for a crisis changed.
 *
 * Owner: `resilience` (National Resilience Command System) — no other service may publish this.
 */
export const ResilienceReliefPlanUpdatedV1 = defineEvent({
  type: 'resilience.relief-plan.updated.v1',
  owner: 'resilience',
  summary: 'The resourced relief plan for a crisis changed.',
  tags: ['resilience'],
  payload: z.object({
    crisisId: z.string(),
    governorate: z.string(),
    requiredResources: z.array(z.string()),
    coveragePct: z.number().min(0).max(1),
    updatedAt: z.string(),
  }),
  example: {
    crisisId: 'crisi_0001',
    governorate: 'TN-11',
    requiredResources: ['water-tanker', 'ambulance'],
    coveragePct: 0.42,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Resilience needs a resource another ministry controls.
 *
 * Owner: `resilience` (National Resilience Command System) — no other service may publish this.
 */
export const ResilienceResourceRequestCreatedV1 = defineEvent({
  type: 'resilience.resource-request.created.v1',
  owner: 'resilience',
  summary: 'Resilience needs a resource another ministry controls.',
  tags: ['resilience'],
  payload: z.object({
    requestId: z.string(),
    crisisId: z.string(),
    resourceType: z.string(),
    quantity: z.number().int(),
    governorate: z.string(),
    urgency: z.enum(['normal', 'high', 'critical']),
  }),
  example: {
    requestId: 'request_0001',
    crisisId: 'crisi_0001',
    resourceType: 'resourceType-sample',
    quantity: 12,
    governorate: 'TN-11',
    urgency: 'normal',
  },
});

/**
 * Emergency mesh node reachability.
 *
 * Owner: `resilience` (National Resilience Command System) — no other service may publish this.
 */
export const ResilienceMeshNodeStatusV1 = defineEvent({
  type: 'resilience.mesh-node.status.v1',
  owner: 'resilience',
  summary: 'Emergency mesh node reachability.',
  tags: ['resilience'],
  payload: z.object({
    nodeId: z.string(),
    governorate: z.string(),
    reachable: z.boolean(),
    batteryPct: z.number().min(0).max(1),
    neighbours: z.number().int(),
    observedAt: z.string(),
  }),
  example: {
    nodeId: 'node_0001',
    governorate: 'TN-11',
    reachable: true,
    batteryPct: 0.42,
    neighbours: 12,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});
