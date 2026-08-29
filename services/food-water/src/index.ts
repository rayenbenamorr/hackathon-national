/**
 * Autonomous Food & Water Grid
 * Ministry: Agriculture & Water Resources
 *
 * Water where it is needed, farms that know their own state, fisheries that are not guessed at.
 *
 * Turn water from a resource that is discovered to be missing into a resource that is forecast — and make that forecast reach the ministries whose plans depend on it.
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
  id: 'food-water',
  name: 'Autonomous Food & Water Grid',
  description:
    'Water where it is needed, farms that know their own state, fisheries that are not guessed at.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
