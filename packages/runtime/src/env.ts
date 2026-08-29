import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * A 30-line .env reader instead of a dependency.
 *
 * `dotenv` would be one more package to install on 1 500 laptops for behaviour
 * we can write once and never think about. Existing environment variables
 * always win, so CI and `PLATFORM_PORT=5000 pnpm dev` behave as expected.
 */
export function loadEnv(file = '.env'): void {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
