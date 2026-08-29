import { SERVICES_PART_1 } from './services.part1.mjs';
import { SERVICES_PART_2 } from './services.part2.mjs';
import { RELATIONS } from './relations.mjs';
import { POLES, poleOf, validatePoles } from './poles.mjs';

export const SERVICES = [...SERVICES_PART_1, ...SERVICES_PART_2];
export { RELATIONS, POLES, poleOf };

export const SERVICE_IDS = SERVICES.map((s) => s.id);

// The hierarchy is checked here, once, so a mis-assigned ministry stops the
// generator instead of producing six screens that disagree with each other.
validatePoles(SERVICE_IDS);

export function serviceById(id) {
  return SERVICES.find((s) => s.id === id);
}

/** Every declared event, with its owner. */
export function allEvents() {
  return SERVICES.flatMap((service) => service.events.map((event) => ({ ...event, owner: service.id })));
}

export function eventByType(type) {
  return allEvents().find((e) => e.type === type);
}

/**
 * Flattened relation edges.
 * `source` PROVIDES (publishes the event / exposes the API);
 * `target` CONSUMES. The registry in relations.mjs is keyed by consumer, which
 * is how a developer thinks ("what does my service listen to?"), so this is
 * where the two views are reconciled — once, here.
 */
export function relationEdges() {
  const edges = [];
  for (const [consumer, entries] of Object.entries(RELATIONS)) {
    for (const entry of entries) {
      edges.push({
        source: entry.source,
        target: consumer,
        kind: entry.kind,
        ref: entry.ref,
        criticality: entry.criticality,
        reason: entry.reason,
      });
    }
  }
  return edges;
}

/** Distinct partners per service, counting both directions (§2). */
export function connectivity() {
  const partners = new Map(SERVICE_IDS.map((id) => [id, new Set()]));
  for (const edge of relationEdges()) {
    partners.get(edge.source)?.add(edge.target);
    partners.get(edge.target)?.add(edge.source);
  }
  return Object.fromEntries([...partners].map(([id, set]) => [id, [...set].sort()]));
}

export const MINIMUM_PARTNERS = 14;
