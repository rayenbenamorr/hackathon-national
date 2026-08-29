/**
 * Tunisia Cultural Intelligence Network
 * Ministry: Culture
 *
 * Cultural assets, immersive access and a creative economy that can be measured.
 *
 * Make culture an infrastructure with a state — conserved, visited, funded — rather than a calendar of events.
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
  id: 'culture',
  name: 'Tunisia Cultural Intelligence Network',
  description: 'Cultural assets, immersive access and a creative economy that can be measured.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
