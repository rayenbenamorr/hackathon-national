/**
 * Environmental Nervous System
 * Ministry: Environment
 *
 * The country senses itself: air, water, climate and the circular use of what is thrown away.
 *
 * Publish environmental truth continuously and early enough that other ministries can act on it rather than report it.
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
  id: 'environment',
  name: 'Environmental Nervous System',
  description: 'The country senses itself: air, water, climate and the circular use of what is thrown away.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
