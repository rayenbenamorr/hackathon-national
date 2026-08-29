/**
 * Connected Health Intelligence System
 * Ministry: Health
 *
 * Hospital capacity, epidemic signals and care that reaches beyond the hospital walls.
 *
 * Publish capacity continuously so no other ministry has to guess it, and read the environment so that a health event is anticipated rather than counted.
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
  id: 'health',
  name: 'Connected Health Intelligence System',
  description: 'Hospital capacity, epidemic signals and care that reaches beyond the hospital walls.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
