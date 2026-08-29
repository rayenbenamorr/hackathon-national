import { describe, expect, it, beforeEach } from 'vitest';
import { z } from 'zod';
import { createAiClient, setAiProvider, synthesizeFromSchema } from '@platform/ai';

/**
 * The promise the whole platform rests on (§13):
 *
 *   "The entire platform must work without requiring students to possess paid
 *    API keys."
 *
 * Which in practice means: `ai.structured()` returns a value that satisfies the
 * caller's schema, offline, every time — including integer, range and enum
 * constraints, which is where the naive version failed.
 */
describe('AI mock mode', () => {
  beforeEach(() => {
    process.env.AI_PROVIDER = 'mock';
    setAiProvider(null);
  });

  const Forecast = z.object({
    forecastId: z.string(),
    governorate: z.string(),
    horizonDays: z.number().int(),
    demandM3Day: z.number(),
    confidence: z.number().min(0).max(1),
    drivers: z.array(z.string()),
    severity: z.enum(['watch', 'alert', 'critical']),
    predictedAt: z.string(),
  });

  it('produces a value that satisfies the schema, with no API key', async () => {
    const ai = createAiClient('food-water');
    const result = await ai.structured(Forecast, 'Forecast water demand for Kairouan.');
    expect(Forecast.safeParse(result).success).toBe(true);
    expect(ai.mock).toBe(true);
  });

  it('respects integer and range constraints', () => {
    for (let i = 0; i < 30; i++) {
      const value = synthesizeFromSchema(Forecast, `seed-${i}`);
      expect(Number.isInteger(value.horizonDays), `horizonDays was ${value.horizonDays}`).toBe(true);
      expect(value.confidence).toBeGreaterThanOrEqual(0);
      expect(value.confidence).toBeLessThanOrEqual(1);
      expect(['watch', 'alert', 'critical']).toContain(value.severity);
    }
  });

  it('is deterministic for the same prompt', async () => {
    const ai = createAiClient('food-water');
    const a = await ai.structured(Forecast, 'same prompt');
    const b = await ai.structured(Forecast, 'same prompt');
    expect(a).toEqual(b);
  });

  it('carries the caller input through, so a mocked answer stays coherent', async () => {
    const ai = createAiClient('food-water');
    const result = await ai.structured(Forecast, 'Forecast for Kairouan', {
      hints: { governorate: 'TN-41', horizonDays: 9 },
    });
    expect(result.governorate).toBe('TN-41');
    expect(result.horizonDays).toBe(9);
  });

  it('retrieves the relevant passage in RAG, offline', async () => {
    const ai = createAiClient('justice');
    const base = ai.knowledgeBase('legal-texts');
    await base.add([
      { id: 'a', text: 'Water abstraction permits are issued by the regional water authority.' },
      { id: 'b', text: 'Commercial leases follow the rules on tenant notice periods.' },
      { id: 'c', text: 'Road traffic penalties are set by decree and revised annually.' },
    ]);
    const hits = await base.search('who issues a water abstraction permit', 2);
    expect(hits[0].id).toBe('a');
    expect(hits[0].score).toBeGreaterThan(0);
  });

  it('runs an agent loop that actually calls a tool', async () => {
    const ai = createAiClient('resilience');
    let called = 0;
    const run = await ai.agent(
      'Find the nearest available ambulance to the incident and report the distance.',
      [
        {
          name: 'nearest_ambulance',
          description: 'Find the nearest available ambulance to a point',
          parameters: z.object({}),
          execute: () => {
            called += 1;
            return { resourceId: 'resource_1', distanceKm: 4.2 };
          },
        },
      ],
      { maxSteps: 3 },
    );
    expect(called).toBeGreaterThan(0);
    expect(run.toolsUsed).toContain('nearest_ambulance');
    expect(run.mock).toBe(true);
  });

  it('classifies without a model', async () => {
    const ai = createAiClient('safety-emergency');
    const result = await ai.classify('a bridge collapsed and cars are trapped', [
      'fire',
      'road-accident',
      'flood',
    ]);
    expect(['fire', 'road-accident', 'flood']).toContain(result.label);
    expect(result.confidence).toBeGreaterThan(0);
  });
});
