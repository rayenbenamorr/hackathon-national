/**
 * National Land Intelligence System
 * Ministry: State Property & Land Affairs
 *
 * Parcels, zoning and whether a site is actually a good idea.
 *
 * Answer "can this be built here, and should it" with evidence from every other ministry rather than with a map alone.
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
  id: 'land',
  name: 'National Land Intelligence System',
  description: 'Parcels, zoning and whether a site is actually a good idea.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
