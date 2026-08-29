import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Vitest does not read `paths` out of tsconfig, so the same alias table is
 * mirrored here. If you add a package, add it in BOTH tsconfig.base.json and
 * this file — `pnpm architecture:check` fails when the two drift apart.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@platform/refs': at('./packages/refs/src/index.ts'),
      '@platform/contracts': at('./packages/contracts/src/index.ts'),
      '@platform/events': at('./packages/events/src/index.ts'),
      '@platform/data': at('./packages/data/src/index.ts'),
      '@platform/observability': at('./packages/observability/src/index.ts'),
      '@platform/auth': at('./packages/auth/src/index.ts'),
      '@platform/service-kit': at('./packages/service-kit/src/index.ts'),
      '@platform/sdk': at('./packages/sdk/src/index.ts'),
      '@platform/ai': at('./packages/ai/src/index.ts'),
      '@platform/iot': at('./packages/iot/src/index.ts'),
      '@platform/digital-twin': at('./packages/digital-twin/src/index.ts'),
      '@platform/geo': at('./packages/geo/src/index.ts'),
      '@platform/runtime/domains.ts': at('./packages/runtime/src/domains.ts'),
      '@platform/runtime': at('./packages/runtime/src/index.ts'),
      '@platform/testing': at('./packages/testing/src/index.ts'),
      '@platform/student-tools': at('./packages/student-tools/src/index.ts'),
      '@platform/policies': at('./packages/policies/src/index.ts'),
      '@platform/rules': at('./packages/rules/src/index.ts'),
      '@platform/scoring': at('./packages/scoring/src/index.ts'),
      '@platform/governance': at('./packages/governance/src/index.ts'),
    },
  },
  test: {
    globals: false,
    environment: 'node',
    include: [
      'services/**/tests/**/*.test.ts',
      'packages/**/tests/**/*.test.ts',
      'apps/**/tests/**/*.test.ts',
      'tools/tests/**/*.test.ts',
    ],
    testTimeout: 20000,
    hookTimeout: 20000,
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } },
  },
});
