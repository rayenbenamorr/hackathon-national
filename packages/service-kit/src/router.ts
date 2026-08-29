import type { RouteDefinition } from './types.ts';

interface Compiled {
  route: RouteDefinition;
  segments: string[];
}

export class Router {
  private readonly compiled: Compiled[];

  constructor(routes: RouteDefinition[]) {
    // Longest, most specific paths first, so "/assets/health" is never eaten by "/assets/:id".
    this.compiled = routes
      .map((route) => ({ route, segments: split(route.path) }))
      .sort((a, b) => {
        const staticA = a.segments.filter((s) => !s.startsWith(':')).length;
        const staticB = b.segments.filter((s) => !s.startsWith(':')).length;
        if (staticB !== staticA) return staticB - staticA;
        return b.segments.length - a.segments.length;
      });
  }

  match(method: string, path: string): { route: RouteDefinition; params: Record<string, string> } | null {
    const parts = split(path);
    for (const { route, segments } of this.compiled) {
      if (route.method !== method) continue;
      if (segments.length !== parts.length) continue;

      const params: Record<string, string> = {};
      let matched = true;
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (segment.startsWith(':')) {
          params[segment.slice(1)] = decodeURIComponent(parts[i]);
        } else if (segment !== parts[i]) {
          matched = false;
          break;
        }
      }
      if (matched) return { route, params };
    }
    return null;
  }

  /** Paths that exist under another method — turns a 404 into a useful 405. */
  otherMethods(path: string): string[] {
    const parts = split(path);
    return this.compiled
      .filter(({ segments }) => segments.length === parts.length)
      .filter(({ segments }) => segments.every((s, i) => s.startsWith(':') || s === parts[i]))
      .map(({ route }) => route.method);
  }

  list(): RouteDefinition[] {
    return this.compiled.map((c) => c.route);
  }
}

function split(path: string): string[] {
  return path.split('/').filter(Boolean);
}
