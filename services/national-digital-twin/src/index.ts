/**
 * Tunisia National Digital Twin
 * Ministry: Planning / Prime Ministry
 *
 * The country as one queryable model, assembled from what the other 23 publish.
 *
 * Hold the whole picture without owning anyone else data: aggregate references and signals, run scenarios across them, and hand every ministry back the context it cannot see alone.
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
  id: 'national-digital-twin',
  name: 'Tunisia National Digital Twin',
  description: 'The country as one queryable model, assembled from what the other 23 publish.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
