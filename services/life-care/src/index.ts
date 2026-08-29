/**
 * Life & Care Intelligence OS
 * Ministry: Family, Women, Childhood & Seniors
 *
 * Life events, care capacity and the path to economic independence.
 *
 * Follow a life journey across the ministries that touch it, so that support arrives at the transition instead of after it.
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
  id: 'life-care',
  name: 'Life & Care Intelligence OS',
  description: 'Life events, care capacity and the path to economic independence.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
