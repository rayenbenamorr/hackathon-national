/**
 * EVENT CONTRACTS — Life & Care Intelligence OS
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
 * A life transition was recorded for a cohort.
 *
 * Owner: `life-care` (Life & Care Intelligence OS) — no other service may publish this.
 */
export const CareLifeEventRecordedV1 = defineEvent({
  type: 'care.life-event.recorded.v1',
  owner: 'life-care',
  summary: 'A life transition was recorded for a cohort.',
  tags: ['life-care'],
  payload: z.object({
    eventId: z.string(),
    cohortId: z.string(),
    eventType: z.enum([
      'birth',
      'schooling',
      'graduation',
      'employment',
      'illness',
      'retirement',
      'bereavement',
      'relocation',
    ]),
    governorate: z.string(),
    people: z.number().int(),
    recordedAt: z.string(),
  }),
  example: {
    eventId: 'event_0001',
    cohortId: 'cohort_0001',
    eventType: 'birth',
    governorate: 'TN-11',
    people: 12,
    recordedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A support need was inferred from a life event and other ministry signals.
 *
 * Owner: `life-care` (Life & Care Intelligence OS) — no other service may publish this.
 */
export const CareSupportNeedDetectedV1 = defineEvent({
  type: 'care.support-need.detected.v1',
  owner: 'life-care',
  summary: 'A support need was inferred from a life event and other ministry signals.',
  tags: ['life-care'],
  payload: z.object({
    needId: z.string(),
    cohortId: z.string(),
    needType: z.string(),
    governorate: z.string(),
    urgency: z.enum(['normal', 'high', 'critical']),
    detectedAt: z.string(),
  }),
  example: {
    needId: 'need_0001',
    cohortId: 'cohort_0001',
    needType: 'needType-sample',
    governorate: 'TN-11',
    urgency: 'normal',
    detectedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Care facility capacity changed.
 *
 * Owner: `life-care` (Life & Care Intelligence OS) — no other service may publish this.
 */
export const CareFacilityCapacityUpdatedV1 = defineEvent({
  type: 'care.facility-capacity.updated.v1',
  owner: 'life-care',
  summary: 'Care facility capacity changed.',
  tags: ['life-care'],
  payload: z.object({
    facilityId: z.string(),
    governorate: z.string(),
    capacity: z.number().int(),
    occupied: z.number().int(),
    waitingList: z.number().int(),
    observedAt: z.string(),
  }),
  example: {
    facilityId: 'facility_0001',
    governorate: 'TN-11',
    capacity: 12,
    occupied: 12,
    waitingList: 12,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});
