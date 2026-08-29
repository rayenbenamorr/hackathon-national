/**
 * Justice Intelligence OS
 * Ministry: Justice
 *
 * Case flow, legal knowledge and court capacity as one observable system.
 *
 * Make the journey of a case legible end to end: where it is, what it is waiting on, and which court is saturated — so delay becomes a measurable, addressable quantity rather than an anecdote.
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
  id: 'justice',
  name: 'Justice Intelligence OS',
  description: 'Case flow, legal knowledge and court capacity as one observable system.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
