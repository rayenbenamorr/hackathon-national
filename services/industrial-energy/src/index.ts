/**
 * Industrial & Energy Intelligence Grid
 * Ministry: Industry & Energy
 *
 * Production, grid load and the waste of one plant becoming the input of another.
 *
 * Run industry and energy as one system: the grid knows what industry is about to do, and industry knows what the grid can afford.
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
  id: 'industrial-energy',
  name: 'Industrial & Energy Intelligence Grid',
  description: 'Production, grid load and the waste of one plant becoming the input of another.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
