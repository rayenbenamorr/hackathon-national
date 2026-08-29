/**
 * EVENT CONTRACTS — Environmental Nervous System
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
 * Air quality at a station. Health, Education, Mobility and Tourism all react to it.
 *
 * Owner: `environment` (Environmental Nervous System) — no other service may publish this.
 */
export const EnvironmentAirQualityUpdatedV1 = defineEvent({
  type: 'environment.air-quality.updated.v1',
  owner: 'environment',
  summary: 'Air quality at a station. Health, Education, Mobility and Tourism all react to it.',
  tags: ['environment'],
  payload: z.object({
    stationId: z.string(),
    governorate: z.string(),
    location: GeoLocation,
    pm25: z.number(),
    no2: z.number(),
    airQualityIndex: z.number(),
    observedAt: z.string(),
  }),
  example: {
    stationId: 'station_0001',
    governorate: 'TN-11',
    location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
    pm25: 42.5,
    no2: 42.5,
    airQualityIndex: 42.5,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Water quality at a station.
 *
 * Owner: `environment` (Environmental Nervous System) — no other service may publish this.
 */
export const EnvironmentWaterQualityUpdatedV1 = defineEvent({
  type: 'environment.water-quality.updated.v1',
  owner: 'environment',
  summary: 'Water quality at a station.',
  tags: ['environment'],
  payload: z.object({
    stationId: z.string(),
    governorate: z.string(),
    turbidityNtu: z.number(),
    salinityGl: z.number(),
    potable: z.boolean(),
    observedAt: z.string(),
  }),
  example: {
    stationId: 'station_0001',
    governorate: 'TN-11',
    turbidityNtu: 42.5,
    salinityGl: 42.5,
    potable: true,
    observedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * Climate risk for a zone: drought, heat, flood.
 *
 * Owner: `environment` (Environmental Nervous System) — no other service may publish this.
 */
export const EnvironmentClimateRiskUpdatedV1 = defineEvent({
  type: 'environment.climate-risk.updated.v1',
  owner: 'environment',
  summary: 'Climate risk for a zone: drought, heat, flood.',
  tags: ['environment'],
  payload: z.object({
    governorate: z.string(),
    droughtIndex: z.number().min(0).max(1),
    heatRisk: z.number().min(0).max(1),
    floodRisk: z.number().min(0).max(1),
    horizonMonths: z.number().int(),
    updatedAt: z.string(),
  }),
  example: {
    governorate: 'TN-11',
    droughtIndex: 0.42,
    heatRisk: 0.42,
    floodRisk: 0.42,
    horizonMonths: 12,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});

/**
 * A waste stream volume or composition changed.
 *
 * Owner: `environment` (Environmental Nervous System) — no other service may publish this.
 */
export const EnvironmentWasteStreamUpdatedV1 = defineEvent({
  type: 'environment.waste-stream.updated.v1',
  owner: 'environment',
  summary: 'A waste stream volume or composition changed.',
  tags: ['environment'],
  payload: z.object({
    streamId: z.string(),
    governorate: z.string(),
    material: z.string(),
    tonnesPerYear: z.number(),
    recoverable: z.number().min(0).max(1),
    updatedAt: z.string(),
  }),
  example: {
    streamId: 'stream_0001',
    governorate: 'TN-11',
    material: 'material-sample',
    tonnesPerYear: 42.5,
    recoverable: 0.42,
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
});
