/**
 * National Safety & Emergency Grid
 * Ministry: Interior
 *
 * Incidents, dispatch and road risk — the fastest loop on the platform.
 *
 * Receive an incident from anywhere, understand it in seconds, and pull the nearest capable resource from whichever ministry owns it.
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
  id: 'safety-emergency',
  name: 'National Safety & Emergency Grid',
  description: 'Incidents, dispatch and road risk — the fastest loop on the platform.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
