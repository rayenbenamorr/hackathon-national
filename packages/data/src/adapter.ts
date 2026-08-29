import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type Row = Record<string, unknown> & { id: string };
export type CollectionSnapshot = Record<string, Row>;
export type NamespaceSnapshot = Record<string, CollectionSnapshot>;

/**
 * The seam that lets this platform outgrow the hackathon.
 *
 * Everything above this interface is written against `StoreAdapter`. Swapping
 * the JSON files for PostgreSQL (one schema per service — §7) means writing one
 * new adapter, not touching 24 services. That is the whole point of it existing.
 */
export interface StoreAdapter {
  load(namespace: string): NamespaceSnapshot;
  persist(namespace: string, snapshot: NamespaceSnapshot): void;
  namespaces(): string[];
  reset(namespace?: string): void;
}

/**
 * Development adapter: one JSON file per service, under `.data/`.
 *
 * Chosen over SQLite/Postgres on purpose (ADR-0003): zero native modules, zero
 * server to install, and a student can OPEN `.data/health.json` in an editor and
 * see their own rows. For 1 200 beginners that legibility is worth more than
 * query power they will not use in six days.
 */
export class JsonFileAdapter implements StoreAdapter {
  private readonly dir: string;
  private readonly cache = new Map<string, NamespaceSnapshot>();
  private readonly pending = new Set<string>();
  private timer: NodeJS.Timeout | null = null;

  constructor(dir = process.env.DATA_DIR ?? '.data') {
    this.dir = resolve(process.cwd(), dir);
    mkdirSync(this.dir, { recursive: true });
  }

  private file(namespace: string): string {
    if (!/^[a-z0-9-]+$/.test(namespace)) {
      throw new Error(`Invalid store namespace "${namespace}". Use lowercase, digits and dashes.`);
    }
    return join(this.dir, `${namespace}.json`);
  }

  load(namespace: string): NamespaceSnapshot {
    const cached = this.cache.get(namespace);
    if (cached) return cached;

    const path = this.file(namespace);
    let snapshot: NamespaceSnapshot = {};
    if (existsSync(path)) {
      try {
        snapshot = JSON.parse(readFileSync(path, 'utf8')) as NamespaceSnapshot;
      } catch {
        // A corrupted local file must never stop a student's platform from booting.
        snapshot = {};
      }
    }
    this.cache.set(namespace, snapshot);
    return snapshot;
  }

  persist(namespace: string, snapshot: NamespaceSnapshot): void {
    this.cache.set(namespace, snapshot);
    this.pending.add(namespace);
    // Debounced: a seeding burst writes once, not four hundred times.
    if (this.timer) return;
    this.timer = setTimeout(() => this.flush(), 120);
    this.timer.unref?.();
  }

  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    for (const namespace of this.pending) {
      const snapshot = this.cache.get(namespace) ?? {};
      writeFileSync(this.file(namespace), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    }
    this.pending.clear();
  }

  namespaces(): string[] {
    if (!existsSync(this.dir)) return [];
    return readdirSync(this.dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''));
  }

  reset(namespace?: string): void {
    if (namespace) {
      this.cache.delete(namespace);
      this.pending.delete(namespace);
      rmSync(this.file(namespace), { force: true });
      return;
    }
    this.cache.clear();
    this.pending.clear();
    for (const ns of this.namespaces()) rmSync(this.file(ns), { force: true });
  }
}

/** In-memory adapter used by tests, so a test run never touches `.data/`. */
export class MemoryAdapter implements StoreAdapter {
  private readonly data = new Map<string, NamespaceSnapshot>();

  load(namespace: string): NamespaceSnapshot {
    if (!this.data.has(namespace)) this.data.set(namespace, {});
    return this.data.get(namespace)!;
  }

  persist(namespace: string, snapshot: NamespaceSnapshot): void {
    this.data.set(namespace, snapshot);
  }

  namespaces(): string[] {
    return [...this.data.keys()];
  }

  reset(namespace?: string): void {
    if (namespace) this.data.delete(namespace);
    else this.data.clear();
  }
}
