import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import type { ServerResponse } from 'node:http';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * Serves the student portal and the observability app.
 *
 * No bundler, no dev server, no build step: the portal is hand-written HTML,
 * CSS and ES modules served straight from disk by the same process that runs
 * the 24 ministries. One command, one port, nothing to install (ADR-0005).
 */
export function createStaticHandler(root: string, prefix = '') {
  const base = resolve(root);

  return function serve(path: string, res: ServerResponse): boolean {
    let relative = prefix && path.startsWith(prefix) ? path.slice(prefix.length) : path;
    if (!relative || relative === '/') relative = '/index.html';

    // Path traversal guard: a resolved file must stay under the served root.
    const target = resolve(join(base, normalize(relative)));
    if (!target.startsWith(base)) {
      res.writeHead(403).end('Forbidden');
      return true;
    }

    if (!existsSync(target) || !statSync(target).isFile()) return false;

    const body = readFileSync(target);
    res.writeHead(200, {
      'content-type': TYPES[extname(target)] ?? 'application/octet-stream',
      'content-length': body.length,
      'cache-control': 'no-store',
    });
    res.end(body);
    return true;
  };
}
