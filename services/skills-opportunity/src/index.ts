/**
 * National Skills & Opportunity OS
 * Ministry: Employment & Vocational Training
 *
 * What the country can do, what it needs to be able to do, and the shortest path between.
 *
 * Read skill demand from what the other ministries are actually building, and open real missions against the gaps.
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
  id: 'skills-opportunity',
  name: 'National Skills & Opportunity OS',
  description: 'What the country can do, what it needs to be able to do, and the shortest path between.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
