/**
 * The observability buffer.
 *
 * Everything a student needs to debug is kept here, in memory, capped, and
 * exposed through the gateway at /__platform/traces, /__platform/logs and
 * /__platform/flows. No OpenTelemetry collector, no Jaeger, no Docker.
 *
 * The unit that matters to a student is not a span, it is a FLOW:
 *
 *   food-water  --agriculture.water-shortage.predicted.v1-->  environment
 *                                                        -->  treasury
 *                                                        -->  national-digital-twin
 */

export interface LogEntry {
  ts: string;
  level: string;
  message: string;
  service?: string;
  traceId?: string;
  [key: string]: unknown;
}

export type HopKind = 'http' | 'event' | 'consume' | 'ai' | 'sensor' | 'error';

export interface Hop {
  id: string;
  ts: string;
  traceId: string;
  correlationId?: string;
  kind: HopKind;
  from: string;
  to: string;
  label: string;
  durationMs?: number;
  ok: boolean;
  detail?: Record<string, unknown>;
}

export interface RelationFailure {
  ts: string;
  from: string;
  to: string;
  reason: string;
  relation: string;
  traceId?: string;
}

const MAX_LOGS = 800;
const MAX_HOPS = 2000;
const MAX_FAILURES = 200;

const logs: LogEntry[] = [];
const hops: Hop[] = [];
const failures: RelationFailure[] = [];

let hopSeq = 0;

export function recordLog(entry: LogEntry): void {
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
}

export function recordHop(hop: Omit<Hop, 'id' | 'ts'> & { ts?: string }): Hop {
  const full: Hop = { id: `hop_${++hopSeq}`, ts: hop.ts ?? new Date().toISOString(), ...hop };
  hops.push(full);
  if (hops.length > MAX_HOPS) hops.splice(0, hops.length - MAX_HOPS);
  return full;
}

export function recordRelationFailure(failure: Omit<RelationFailure, 'ts'>): void {
  failures.push({ ts: new Date().toISOString(), ...failure });
  if (failures.length > MAX_FAILURES) failures.splice(0, failures.length - MAX_FAILURES);
}

export function recentLogs(limit = 200, service?: string): LogEntry[] {
  const pool = service ? logs.filter((l) => l.service === service) : logs;
  return pool.slice(-limit).reverse();
}

export function recentHops(limit = 200, service?: string): Hop[] {
  const pool = service ? hops.filter((h) => h.from === service || h.to === service) : hops;
  return pool.slice(-limit).reverse();
}

export function relationFailures(limit = 100, service?: string): RelationFailure[] {
  const pool = service ? failures.filter((f) => f.from === service || f.to === service) : failures;
  return pool.slice(-limit).reverse();
}

export function trace(traceId: string): Hop[] {
  return hops.filter((h) => h.traceId === traceId);
}

export interface FlowNode {
  service: string;
  via: string;
  ok: boolean;
  children: FlowNode[];
}

/** Rebuilds one trace as the readable tree the student portal draws. */
export function flow(traceId: string): FlowNode | null {
  const chain = trace(traceId);
  if (chain.length === 0) return null;

  const root: FlowNode = { service: chain[0].from, via: 'start', ok: true, children: [] };
  const byService = new Map<string, FlowNode>([[root.service, root]]);

  for (const hop of chain) {
    const parent = byService.get(hop.from) ?? root;
    const node: FlowNode = { service: hop.to, via: hop.label, ok: hop.ok, children: [] };
    parent.children.push(node);
    if (!byService.has(hop.to)) byService.set(hop.to, node);
  }
  return root;
}

export function recentTraceIds(limit = 40): string[] {
  const seen: string[] = [];
  for (let i = hops.length - 1; i >= 0 && seen.length < limit; i--) {
    if (!seen.includes(hops[i].traceId)) seen.push(hops[i].traceId);
  }
  return seen;
}

export function resetObservability(): void {
  logs.length = 0;
  hops.length = 0;
  failures.length = 0;
}
