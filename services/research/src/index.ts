/**
 * Tunisia Research Brain
 * Ministry: Higher Education & Research
 *
 * National research as an addressable capability, and a path from result to deployment.
 *
 * Connect what laboratories can already do to what ministries are currently blocked on — the gap between the two is where most public value is lost.
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
  id: 'research',
  name: 'Tunisia Research Brain',
  description: 'National research as an addressable capability, and a path from result to deployment.',
  modules: [...MODULES],
  routes,
  consumers,
  seed,
});
