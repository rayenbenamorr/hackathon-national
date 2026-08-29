import { z } from 'zod';

/** Small utilities the generated services share, so 24 copies do not drift. */

export const PagingQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(25),
  offset: z.coerce.number().int().min(0).default(0),
  governorate: z.string().optional(),
});
export type Paging = z.infer<typeof PagingQuery>;

export function nowIso(): string {
  return new Date().toISOString();
}

export function groupRows<T extends Record<string, unknown>>(rows: T[], key: string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const value = String(row[key] ?? 'unknown');
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value)!.push(row);
  }
  return groups;
}

export function avg<T extends Record<string, unknown>>(rows: T[], field: string, fallback = 0): number {
  const values = rows.map((r) => Number(r[field])).filter((n) => Number.isFinite(n));
  if (values.length === 0) return fallback;
  return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(3));
}

export function sum<T extends Record<string, unknown>>(rows: T[], field: string): number {
  return Number(rows.reduce((total, r) => total + (Number(r[field]) || 0), 0).toFixed(3));
}

/** Most frequent value — the sensible aggregate for an enum or a label. */
export function mode<T extends Record<string, unknown>>(
  rows: T[],
  field: string,
  fallback = 'unknown',
): string {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row[field];
    if (typeof value !== 'string') continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best = fallback;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export function pick<T>(values: readonly T[], rng: () => number): T {
  return values[Math.floor(rng() * values.length)];
}

export function pickMany<T>(values: readonly T[], rng: () => number, count = 2): T[] {
  const pool = [...values];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length; i++) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 0..1 index from a value in a range — the platform-wide way to normalise. */
export function normalise(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Number(clamp((value - min) / (max - min), 0, 1).toFixed(3));
}
