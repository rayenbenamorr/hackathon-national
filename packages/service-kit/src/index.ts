export * from './types.ts';
export * from './errors.ts';
export * from './router.ts';
export * from './runtime.ts';
export * from './signals.ts';
export * from './helpers.ts';

// Re-exported so a service file has ONE import line for the common case.
// A student writing a feature should not have to know which package a helper
// lives in; Claude Code should not have to guess either.
export { z } from 'zod';
export { listOf, ok } from '@platform/contracts';
export type { EventEnvelope } from '@platform/events';
export type { Identity } from '@platform/auth';
