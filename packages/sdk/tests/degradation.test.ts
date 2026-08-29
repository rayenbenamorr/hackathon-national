import { describe, expect, it, beforeEach } from 'vitest';
import { createPlatformClient, registerServiceEndpoint, resetServiceRegistry } from '@platform/sdk';
import { relationFailures, resetObservability } from '@platform/observability';

/**
 * §28 in one file. The student must read a sentence, not a socket error.
 */
describe('cross-service failure handling', () => {
  beforeEach(() => {
    resetServiceRegistry();
    resetObservability();
  });

  it('names the ministry in plain language when it is not running', async () => {
    const client = createPlatformClient('health');
    await expect(client.call('mobility-logistics', 'GET /resources/nearest')).rejects.toThrow(
      /Autonomous Mobility & Logistics Grid integration is unavailable/,
    );
  });

  it('tells the student what to run next', async () => {
    const client = createPlatformClient('health');
    try {
      await client.call('mobility-logistics', 'GET /resources/nearest');
      expect.unreachable();
    } catch (error) {
      const body = (error as { toJSON: () => Record<string, string> }).toJSON();
      expect(body.whatToDo).toMatch(/pnpm dev/);
      expect(body.degraded).toBe(true);
      expect(JSON.stringify(body)).not.toMatch(/ECONNREFUSED|EADDR|socket/);
    }
  });

  it('records the broken relation so the portal can show it', async () => {
    const client = createPlatformClient('health');
    await client.tryCall('mobility-logistics', 'GET /resources/nearest', {
      relation: 'health -> mobility-logistics',
    });
    const failures = relationFailures(10, 'health');
    expect(failures).toHaveLength(1);
    expect(failures[0].to).toBe('mobility-logistics');
  });

  it('degrades instead of throwing when the caller can cope', async () => {
    const client = createPlatformClient('health');
    const result = await client.tryCall('environment', 'GET /air-quality', { fallback: { items: [] } });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.degraded).toBe(true);
      expect(result.fallback).toEqual({ items: [] });
    }
  });

  it('routes a real call once the ministry is running', async () => {
    registerServiceEndpoint({
      id: 'environment',
      name: 'Environmental Nervous System',
      description: 'test double',
      routes: [],
      handle: async (request) => ({
        status: 200,
        body: { path: request.path, caller: request.identity?.service },
      }),
    });

    const client = createPlatformClient('health');
    const result = await client.call<{ path: string; caller: string }>('environment', 'GET /air-quality');
    expect(result.path).toBe('/air-quality');
    // Service-to-service calls are authenticated as the caller, not as a citizen.
    expect(result.caller).toBe('health');
  });

  it('surfaces an unknown service id as a distinct, actionable message', async () => {
    const client = createPlatformClient('health');
    const result = await client.tryCall('ministry-of-magic', 'GET /spells');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/no ministry service with the id/);
  });
});
