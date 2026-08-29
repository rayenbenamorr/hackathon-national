/**
 * National Talent Intelligence Network
 * Ministry: Youth & Sports
 *
 * Athlete development, facility usage and youth opportunity as one pipeline.
 *
 * Find talent where the facilities and the data already are, and stop losing athletes to injuries and gaps nobody was watching.
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
  id: 'talent',
  name: 'National Talent Intelligence Network',
  description: 'Athlete development, facility usage and youth opportunity as one pipeline.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
