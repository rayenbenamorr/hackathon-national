# ADR-0002 — A monorepo that is a single npm package

**Status:** accepted · **Date:** 2026-08-28

## Context

The structure the brief asks for (§6) is a monorepo: `apps/`, `packages/`,
`services/`. The usual implementation is workspaces — one `package.json` per
package, linked by the package manager.

## Decision

Keep the folder structure. Do **not** give each package its own manifest. One
root `package.json`; cross-package imports resolve through TypeScript path
aliases (`@platform/*`, `@services/*`) declared in `tsconfig.base.json` and
mirrored in `vitest.config.ts`.

`pnpm-workspace.yaml` still declares the globs, so any package can be promoted
to a real workspace member later by adding a manifest.

## Consequences

- One `pnpm install`. No workspace linking, no `workspace:*` protocol, no
  "module not found" caused by a missing build of a sibling package — the single
  most common way a beginner loses an hour in a monorepo.
- The two alias tables can drift. That is a real risk, so **validator rule 13
  fails the build** when a `@platform/*` alias exists in `tsconfig.base.json`
  and not in `vitest.config.ts`.
- Packages cannot have divergent dependencies. Nothing here needs to.

## Alternatives rejected

**pnpm workspaces.** The right answer for a team of engineers; the wrong answer
for 1 500 beginners, where every additional failure mode is paid 1 500 times.

**Turborepo / Nx.** More tooling to learn than the thing being taught.
