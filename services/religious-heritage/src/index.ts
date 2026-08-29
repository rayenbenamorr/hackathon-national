/**
 * Smart Religious Heritage Network
 * Ministry: Religious Affairs
 *
 * Sites that report their own condition, buildings that manage their own energy, knowledge that is sourced.
 *
 * Protect fragile places with sensors instead of inspections, and answer questions about heritage from documented sources only.
 *
 * Read SERVICE_BRIEF.md before changing anything, and RELATIONS.md before
 * changing anything that other ministries depend on.
 */
import { defineService } from '@platform/service-kit';
import { MODULES } from './domain.ts';
import { routes } from './routes.ts';
import { consumers } from './consumers.ts';
import { seed } from './seed.ts';

export default defineService({
  id: 'religious-heritage',
  name: 'Smart Religious Heritage Network',
  description:
    'Sites that report their own condition, buildings that manage their own energy, knowledge that is sourced.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
