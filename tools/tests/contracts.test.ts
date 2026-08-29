import { describe, expect, it } from 'vitest';
import {
  allEventContracts,
  ARCHITECTURE_RELATIONS,
  eventContract,
  SERVICE_DIRECTORY,
} from '@platform/contracts';
import { loadAllServices } from '../../services/registry.ts';

/**
 * CONTRACT DRIFT DETECTION (§11, §24).
 *
 * The architecture registry (tools/spec → architecture/*.yaml → the runtime
 * tables) and the actual code can disagree in exactly three ways, and each one
 * breaks another team silently. All three are tested here.
 */
const definitions = await loadAllServices();

describe('event contracts', () => {
  it('declares 24 ministries', () => {
    expect(Object.keys(SERVICE_DIRECTORY)).toHaveLength(24);
  });

  it('gives every event exactly one owner', () => {
    const owners = new Map<string, string>();
    for (const contract of allEventContracts()) {
      expect(owners.get(contract.type) ?? contract.owner).toBe(contract.owner);
      owners.set(contract.type, contract.owner);
    }
  });

  it('versions every event type', () => {
    for (const contract of allEventContracts()) {
      expect(contract.type, `${contract.type} must end with .vN`).toMatch(/\.v\d+$/);
      expect(contract.version).toBeGreaterThan(0);
    }
  });

  it('carries an example that satisfies its own schema', () => {
    for (const contract of allEventContracts()) {
      const parsed = contract.payload.safeParse(contract.example);
      expect(
        parsed.success,
        `${contract.type}: ${parsed.success ? '' : JSON.stringify(parsed.error.issues)}`,
      ).toBe(true);
    }
  });

  it('is owned by a service that exists and declares it', () => {
    for (const contract of allEventContracts()) {
      expect(Object.keys(SERVICE_DIRECTORY)).toContain(contract.owner);
      const definition = definitions.find((d) => d.id === contract.owner);
      expect(definition, `${contract.owner} has no service definition`).toBeDefined();
    }
  });
});

describe('registry ↔ code', () => {
  it('implements every declared event relation in the consuming service', () => {
    const missing: string[] = [];
    for (const relation of ARCHITECTURE_RELATIONS.filter((r) => r.kind === 'event')) {
      const consumer = definitions.find((d) => d.id === relation.target);
      if (!consumer?.consumers.some((c) => c.event === relation.ref)) {
        missing.push(`${relation.target} ← ${relation.ref}`);
      }
    }
    expect(missing, `relations declared but not implemented:\n${missing.join('\n')}`).toEqual([]);
  });

  it('never consumes an event that nobody publishes', () => {
    const orphans: string[] = [];
    for (const definition of definitions) {
      for (const consumer of definition.consumers) {
        if (!eventContract(consumer.event)) orphans.push(`${definition.id} → ${consumer.event}`);
      }
    }
    expect(orphans, `consumed events with no contract:\n${orphans.join('\n')}`).toEqual([]);
  });

  it('names the right producer in every consumer declaration', () => {
    const wrong: string[] = [];
    for (const definition of definitions) {
      for (const consumer of definition.consumers) {
        const contract = eventContract(consumer.event);
        if (contract && contract.owner !== consumer.from) {
          wrong.push(
            `${definition.id}: ${consumer.event} declared from ${consumer.from}, owned by ${contract.owner}`,
          );
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('gives every service a health endpoint and at least one module', () => {
    for (const definition of definitions) {
      expect(
        definition.routes.some((r) => r.path === '/health'),
        `${definition.id} has no /health`,
      ).toBe(true);
      expect(definition.modules.length, `${definition.id} has no module`).toBeGreaterThan(0);
    }
  });
});
