/**
 * National Digital Identity + Event Bus — Tunisia Digital Nervous System
 *
 * Service registry, event catalogue, pseudonymous identity.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { allServiceEndpoints } from '@platform/sdk';
import { allEventContracts } from '@platform/contracts';
import { eventBus } from '@platform/events';
import { type RequestContext, type ServiceContext } from '@platform/service-kit';
import { COLLECTION, type Sensor } from '../domain.ts';

export const MODULE = {
  id: 'national-digital-identity-event-bus',
  name: 'National Digital Identity + Event Bus',
  purpose: 'Service registry, event catalogue, pseudonymous identity.',
} as const;

/** Every running ministry service and its routes. */
export function listServices(ctx: ServiceContext, _req: RequestContext) {
  return {
    items: allServiceEndpoints().map((endpoint) => ({
      id: endpoint.id,
      name: endpoint.name,
      description: endpoint.description,
      routes: endpoint.routes.map((route) => `${route.method} ${route.path}`),
    })),
    total: allServiceEndpoints().length,
    reportedBy: ctx.id,
  };
}

/** The full event catalogue with owners and subscribers. */
export function listEventCatalog(_ctx: ServiceContext, _req: RequestContext) {
  const subscriptions = eventBus().allSubscriptions();
  return {
    items: allEventContracts().map((contract) => ({
      type: contract.type,
      version: contract.version,
      owner: contract.owner,
      summary: contract.summary,
      subscribers: subscriptions.filter((s) => s.eventType === contract.type).map((s) => s.subscriberService),
      example: contract.example,
    })),
    total: allEventContracts().length,
    bus: eventBus().stats(),
  };
}
