/**
 * Intelligent Treasury OS
 * Ministry: Finance
 *
 * Where public money is, where it is committed, and what it is buying.
 *
 * Make the budget a live object other ministries can query and react to — so a drought, an outage or an epidemic has a visible fiscal consequence the same day, not the following year.
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
  id: 'treasury',
  name: 'Intelligent Treasury OS',
  description: 'Where public money is, where it is committed, and what it is buying.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
