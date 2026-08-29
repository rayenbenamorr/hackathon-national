/**
 * Tunisia Immersive Tourism OS
 * Ministry: Tourism
 *
 * Visitor flows, site pressure and experiences that exist before the visitor arrives.
 *
 * Spread visitors instead of concentrating them, using signals the country already produces — and protect the sites that make the visit worth it.
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
  id: 'tourism',
  name: 'Tunisia Immersive Tourism OS',
  description: 'Visitor flows, site pressure and experiences that exist before the visitor arrives.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
