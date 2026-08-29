/**
 * Smart Trade Network
 * Ministry: Commerce & Export
 *
 * Product passports, export guidance and a supply graph that shows where it will break.
 *
 * Give every exported product a verifiable identity, and give the country a map of the dependencies that decide whether it can be produced at all.
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
  id: 'smart-trade',
  name: 'Smart Trade Network',
  description: 'Product passports, export guidance and a supply graph that shows where it will break.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
