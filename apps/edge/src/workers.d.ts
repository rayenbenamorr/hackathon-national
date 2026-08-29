/**
 * Le strict minimum de l'environnement Workers, declare ici plutot qu'installe.
 *
 * `@cloudflare/workers-types` apporterait des milliers de lignes et une entree
 * de plus dans le lockfile pour deux symboles. Le jour ou ce Worker aura besoin
 * de bindings (KV, D1, Durable Objects), ce fichier disparait au profit du
 * paquet officiel — pas avant.
 */

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

/**
 * `caches.default` est propre a Cloudflare : le cache partage du colo, sans
 * nom. La lib DOM declare bien `caches`, mais avec les seuls caches nommes —
 * d'ou cette augmentation plutot qu'une redeclaration, qui entrerait en
 * conflit.
 */
interface CacheStorage {
  readonly default: Cache;
}
