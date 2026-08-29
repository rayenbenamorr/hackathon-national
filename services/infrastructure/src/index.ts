/**
 * Smart Infrastructure OS
 * Ministry: Equipment & Housing
 *
 * Asset health, maintenance before failure, and housing that runs itself.
 *
 * Replace inspection cycles with condition: every bridge, network and building carries a health score other ministries can plan against.
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
  id: 'infrastructure',
  name: 'Smart Infrastructure OS',
  description: 'Asset health, maintenance before failure, and housing that runs itself.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
