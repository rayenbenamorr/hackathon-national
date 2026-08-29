/**
 * Autonomous Logistics Brain — Autonomous Mobility & Logistics Grid
 *
 * Freight planning and resource dispatch.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { newId } from '@platform/observability';
import { nearest, resolveGovernorate } from '@platform/geo';
import {
  BadRequestError,
  ConflictError,
  nowIso,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Resource } from '../domain.ts';
import { upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'autonomous-logistics-brain',
  name: 'Autonomous Logistics Brain',
  purpose: 'Freight planning and resource dispatch.',
} as const;

/**
 * The closest available resource to a point. Health, Emergency and Resilience all depend on this.
 *
 * The single most-called cross-ministry endpoint on the platform. Health,
 * Emergency and Resilience all reach for it, none of them owns a vehicle.
 */
export function nearestResource(ctx: ServiceContext, req: RequestContext) {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new BadRequestError(
      'Give me a point: /resources/nearest?lat=36.8&lon=10.18&resourceType=ambulance',
    );
  }

  const wanted = req.query.resourceType;
  const candidates = ctx.db.collection<Resource>(COLLECTION).list({
    match: (row) => row.status === 'available' && (!wanted || row.resourceType === wanted),
    limit: 1000,
  });

  const found = nearest({ lat, lon }, candidates, (row) => row.location, {
    limit: Number(req.query.limit ?? 3),
    maxKm: Number(req.query.maxKm ?? 400),
  });

  return {
    from: { lat, lon, governorate: resolveGovernorate({ lat, lon }).code },
    items: found.map((hit) => ({ ...hit.item, distanceKm: hit.distanceKm })),
    total: found.length,
    synthetic: true,
  };
}

/**
 * Assign the closest available resource to a request and broadcast the assignment.
 *
 * Called by Emergency, Health and Resilience. It reserves the resource in this
 * ministry's own database and announces the assignment — the requesting
 * ministry never writes here, it asks.
 */
export async function dispatchResource(ctx: ServiceContext, req: RequestContext) {
  const body = req.body as {
    lat?: number;
    lon?: number;
    resourceType?: string;
    requestedBy?: string;
    reason?: string;
  };
  if (!Number.isFinite(Number(body.lat)) || !Number.isFinite(Number(body.lon))) {
    throw new BadRequestError('POST /dispatch needs { lat, lon, resourceType?, requestedBy?, reason? }.');
  }

  const destination = { lat: Number(body.lat), lon: Number(body.lon) };
  const resources = ctx.db.collection<Resource>(COLLECTION);
  const available = resources.list({
    match: (row) =>
      row.status === 'available' && (!body.resourceType || row.resourceType === body.resourceType),
    limit: 1000,
  });

  const [best] = nearest(destination, available, (row) => row.location, { limit: 1 });
  if (!best) {
    throw new ConflictError(
      `No available ${body.resourceType ?? 'resource'} anywhere in the fleet. ` +
        'This is a real answer, not a failure: the caller should widen the type or escalate.',
      { requested: body.resourceType, availableTotal: available.length },
    );
  }

  const engaged = resources.update(best.item.id, {
    status: 'engaged',
    etaMinutes: Math.round(best.distanceKm * 1.6),
  })!;
  upsertTwin(ctx, engaged);

  const dispatch = {
    dispatchId: newId('dispatch'),
    resourceId: engaged.id,
    resourceType: engaged.resourceType,
    requestedBy: body.requestedBy ?? req.identity.service ?? 'unknown',
    destination: { ...destination, governorate: resolveGovernorate(destination).code },
    etaMinutes: engaged.etaMinutes,
    dispatchedAt: nowIso(),
  };

  await ctx.publish('transport.resource.dispatched.v1', dispatch, {
    traceId: req.trace.traceId,
    correlationId: req.trace.correlationId,
  });

  return { data: dispatch, distanceKm: best.distanceKm, synthetic: true };
}
