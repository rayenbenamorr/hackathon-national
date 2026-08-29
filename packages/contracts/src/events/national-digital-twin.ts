/**
 * EVENT CONTRACTS — Tunisia National Digital Twin
 *
 * Adding an event: declare it here with defineEvent(), then add it to
 * tools/spec/services.part*.mjs and run `pnpm generate` so the manifest,
 * the docs and the architecture registry agree with the code.
 *
 * Changing an event: adding an OPTIONAL field is safe. Anything else needs a
 * new version (`.v2`) with the `.v1` contract kept until every consumer moved.
 */
import { z } from 'zod';
import { defineEvent } from '../registry.ts';

/**
 * The national twin recomputed a region state.
 *
 * Owner: `national-digital-twin` (Tunisia National Digital Twin) — no other service may publish this.
 */
export const TwinStateUpdatedV1 = defineEvent({
  type: 'twin.state.updated.v1',
  owner: 'national-digital-twin',
  summary: 'The national twin recomputed a region state.',
  tags: ['national-digital-twin'],
  payload: z.object({
    governorate: z.string(),
    stressIndex: z.number().min(0).max(1),
    drivers: z.array(z.string()),
    contributingServices: z.array(z.string()),
    updatedAt: z.string(),
  }),
  example: {
    governorate: 'TN-11',
    stressIndex: 0.42,
    drivers: ['drought-index', 'sensor-observations'],
    contributingServices: ['environment', 'health'],
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A cross-sector scenario finished running.
 *
 * Owner: `national-digital-twin` (Tunisia National Digital Twin) — no other service may publish this.
 */
export const TwinScenarioCompletedV1 = defineEvent({
  type: 'twin.scenario.completed.v1',
  owner: 'national-digital-twin',
  summary: 'A cross-sector scenario finished running.',
  tags: ['national-digital-twin'],
  payload: z.object({
    scenarioId: z.string(),
    question: z.string(),
    governorate: z.string(),
    outcome: z.string(),
    impactedSectors: z.array(z.string()),
    confidence: z.number().min(0).max(1),
    completedAt: z.string(),
  }),
  example: {
    scenarioId: 'scenario_0001',
    question: 'Synthetic example value for question.',
    governorate: 'TN-11',
    outcome: 'Synthetic example value for outcome.',
    impactedSectors: ['water', 'health'],
    confidence: 0.42,
    completedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A region deviates from its own baseline across several sectors at once.
 *
 * Owner: `national-digital-twin` (Tunisia National Digital Twin) — no other service may publish this.
 */
export const TwinAnomalyDetectedV1 = defineEvent({
  type: 'twin.anomaly.detected.v1',
  owner: 'national-digital-twin',
  summary: 'A region deviates from its own baseline across several sectors at once.',
  tags: ['national-digital-twin'],
  payload: z.object({
    anomalyId: z.string(),
    governorate: z.string(),
    metric: z.string(),
    deviation: z.number(),
    likelyCauses: z.array(z.string()),
    detectedAt: z.string(),
  }),
  example: {
    anomalyId: 'anomaly_0001',
    governorate: 'TN-11',
    metric: 'metric-sample',
    deviation: 42.5,
    likelyCauses: ['sensor-drift', 'seasonal-shift'],
    detectedAt: '2026-08-28T09:00:00.000Z',
  },
});
