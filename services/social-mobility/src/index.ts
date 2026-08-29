/**
 * Social Mobility OS
 * Ministry: Social Affairs
 *
 * Household vulnerability and benefits that arrive without a form.
 *
 * Detect need from signals other ministries already produce, instead of waiting for a household to prove it at a counter.
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
  id: 'social-mobility',
  name: 'Social Mobility OS',
  description: 'Household vulnerability and benefits that arrive without a form.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
