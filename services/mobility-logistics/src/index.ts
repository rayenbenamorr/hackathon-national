/**
 * Autonomous Mobility & Logistics Grid
 * Ministry: Transport
 *
 * Where people and goods are moving, and the nearest vehicle that can be sent.
 *
 * Answer one question faster than anyone else in the country: what is the closest available resource, and how long until it arrives.
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
  id: 'mobility-logistics',
  name: 'Autonomous Mobility & Logistics Grid',
  description: 'Where people and goods are moving, and the nearest vehicle that can be sent.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
