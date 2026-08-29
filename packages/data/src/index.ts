/**
 * DATABASE FOUNDATION
 *
 * ONE HARD RULE, ENFORCED BY THE SHAPE OF THIS API (§7):
 *
 *   > No service is allowed to directly query another service's database.
 *
 * A service never chooses its namespace. `openServiceStore(id)` is called once,
 * by the service runtime, with the service's own id. There is no method on
 * `ServiceStore` that takes a namespace, so there is no expression a student
 * (or Claude) can write inside `services/health` that reads `food-water` rows.
 * Cross-service data travels through APIs and events, or not at all.
 *
 * `pnpm architecture:check` additionally greps for attempts to bypass this.
 */
import {
  JsonFileAdapter,
  MemoryAdapter,
  type Row,
  type StoreAdapter,
  type NamespaceSnapshot,
} from './adapter.ts';
import { newId } from '@platform/observability';

export { JsonFileAdapter, MemoryAdapter };
export type { StoreAdapter, Row, NamespaceSnapshot };

export interface QueryOptions<T> {
  where?: Partial<Record<keyof T & string, unknown>>;
  match?: (doc: T) => boolean;
  sort?: { key: keyof T & string; direction?: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

export interface Collection<T extends { id: string }> {
  readonly name: string;
  insert(doc: Omit<T, 'id'> & { id?: string }): T;
  insertMany(docs: Array<Omit<T, 'id'> & { id?: string }>): T[];
  upsert(doc: T): T;
  get(id: string): T | undefined;
  require(id: string): T;
  update(id: string, patch: Partial<T>): T | undefined;
  delete(id: string): boolean;
  list(options?: QueryOptions<T>): T[];
  findOne(match: (doc: T) => boolean): T | undefined;
  count(options?: QueryOptions<T>): number;
  clear(): void;
}

export interface ServiceStore {
  readonly serviceId: string;
  collection<T extends { id: string }>(name: string): Collection<T>;
  collections(): string[];
  isEmpty(): boolean;
  stats(): Record<string, number>;
  flush(): void;
}

let adapter: StoreAdapter = new JsonFileAdapter();

/** Tests and the reset tool swap the adapter; nothing else should. */
export function setStoreAdapter(next: StoreAdapter): void {
  adapter = next;
}
export function getStoreAdapter(): StoreAdapter {
  return adapter;
}

function matches<T extends { id: string }>(doc: T, options: QueryOptions<T>): boolean {
  if (options.where) {
    for (const [key, value] of Object.entries(options.where)) {
      if (value === undefined) continue;
      if ((doc as Record<string, unknown>)[key] !== value) return false;
    }
  }
  if (options.match && !options.match(doc)) return false;
  return true;
}

export function openServiceStore(serviceId: string): ServiceStore {
  const snapshot: NamespaceSnapshot = adapter.load(serviceId);
  const save = () => adapter.persist(serviceId, snapshot);

  const collection = <T extends { id: string }>(name: string): Collection<T> => {
    if (!snapshot[name]) snapshot[name] = {};
    const bucket = () => snapshot[name] as unknown as Record<string, T>;

    return {
      name,

      insert(doc) {
        const id = doc.id ?? newId(name.replace(/s$/, '').slice(0, 8));
        const row = { ...doc, id } as T;
        bucket()[id] = row;
        save();
        return row;
      },

      insertMany(docs) {
        const rows = docs.map((doc) => {
          const id = doc.id ?? newId(name.replace(/s$/, '').slice(0, 8));
          const row = { ...doc, id } as T;
          bucket()[id] = row;
          return row;
        });
        save();
        return rows;
      },

      upsert(doc) {
        bucket()[doc.id] = doc;
        save();
        return doc;
      },

      get(id) {
        return bucket()[id];
      },

      require(id) {
        const found = bucket()[id];
        if (!found) {
          const error = new Error(`${name} "${id}" does not exist in ${serviceId}.`);
          (error as Error & { statusCode?: number }).statusCode = 404;
          throw error;
        }
        return found;
      },

      update(id, patch) {
        const current = bucket()[id];
        if (!current) return undefined;
        const next = { ...current, ...patch, id } as T;
        bucket()[id] = next;
        save();
        return next;
      },

      delete(id) {
        if (!bucket()[id]) return false;
        delete bucket()[id];
        save();
        return true;
      },

      list(options = {}) {
        let rows = Object.values(bucket()).filter((doc) => matches(doc, options));
        if (options.sort) {
          const { key, direction = 'asc' } = options.sort;
          const sign = direction === 'desc' ? -1 : 1;
          rows = rows.sort((a, b) => {
            const av = (a as Record<string, unknown>)[key];
            const bv = (b as Record<string, unknown>)[key];
            if (av === bv) return 0;
            return (av! > bv! ? 1 : -1) * sign;
          });
        }
        const offset = options.offset ?? 0;
        return options.limit === undefined ? rows.slice(offset) : rows.slice(offset, offset + options.limit);
      },

      findOne(match) {
        return Object.values(bucket()).find(match);
      },

      count(options = {}) {
        return Object.values(bucket()).filter((doc) => matches(doc, options)).length;
      },

      clear() {
        snapshot[name] = {};
        save();
      },
    };
  };

  return {
    serviceId,
    collection,
    collections: () => Object.keys(snapshot),
    isEmpty: () => Object.values(snapshot).every((c) => Object.keys(c).length === 0),
    stats: () =>
      Object.fromEntries(Object.entries(snapshot).map(([name, rows]) => [name, Object.keys(rows).length])),
    flush: () => {
      if (adapter instanceof JsonFileAdapter) adapter.flush();
    },
  };
}

/**
 * ADMINISTRATIVE read across namespaces — for the platform portal and the
 * `pnpm reset` tool only. Deliberately named so that any use inside
 * `services/**` is obvious in review and is FLAGGED by the architecture
 * validator as a cross-service database access violation.
 */
export function inspectAllStores(): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const ns of adapter.namespaces()) {
    const snapshot = adapter.load(ns);
    out[ns] = Object.fromEntries(Object.entries(snapshot).map(([c, rows]) => [c, Object.keys(rows).length]));
  }
  return out;
}
