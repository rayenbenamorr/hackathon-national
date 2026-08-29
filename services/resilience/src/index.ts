/**
 * National Resilience Command System
 * Ministry: Interior / Civil Protection
 *
 * Crisis declaration, relief logistics and a mesh that survives the network going down.
 *
 * Hold one shared picture of a crisis across every ministry, and turn it into a relief plan with named resources — because in a crisis the failure is almost never lack of resources, it is lack of a shared picture.
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
  id: 'resilience',
  name: 'National Resilience Command System',
  description: 'Crisis declaration, relief logistics and a mesh that survives the network going down.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
