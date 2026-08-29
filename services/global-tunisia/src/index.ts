/**
 * Global Tunisia Network
 * Ministry: Foreign Affairs
 *
 * The diaspora as a live network: consular load, skills abroad, opportunities home.
 *
 * Treat Tunisians abroad as a connected part of the national system — a source of skills, investment and demand, not a mailing list.
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
  id: 'global-tunisia',
  name: 'Global Tunisia Network',
  description: 'The diaspora as a live network: consular load, skills abroad, opportunities home.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
