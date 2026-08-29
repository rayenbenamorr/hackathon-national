import { randomUUID } from 'node:crypto';

/** Short, readable, sortable-enough identifiers. Students read these in the portal. */
export function newId(prefix = 'id'): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function newTraceId(): string {
  return newId('trace');
}

export function newCorrelationId(): string {
  return newId('corr');
}

export function newSpanId(): string {
  return newId('span');
}

export function newEventId(): string {
  return newId('evt');
}
