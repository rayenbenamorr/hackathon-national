/**
 * Adaptive Education OS
 * Ministry: Education
 *
 * A learning twin per learner cohort, schools that report their own condition, one knowledge graph.
 *
 * Adapt what is taught to what the country is measurably about to need, and notice a failing school building before it is a headline.
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
  id: 'education',
  name: 'Adaptive Education OS',
  description:
    'A learning twin per learner cohort, schools that report their own condition, one knowledge graph.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
