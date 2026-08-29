/**
 * Tunisia Land Digital Twin — National Land Intelligence System
 *
 * Parcels, zoning and current use.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { seededRandom } from '@platform/geo';
import {
  NotFoundError,
  nowIso,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Parcel } from '../domain.ts';
import { makeParcel, twinIdFor, upsertTwin } from '../seed.ts';

export const MODULE = {
  id: 'tunisia-land-digital-twin',
  name: 'Tunisia Land Digital Twin',
  purpose: 'Parcels, zoning and current use.',
} as const;

/** List every land parcel this ministry owns. */
export function listParcels(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Parcel>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One land parcel, with its digital twin. */
export function getParcel(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Parcel>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Land parcel', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/** Create a land parcel. Any field you omit is filled with a plausible synthetic value. */
export async function createParcel(ctx: ServiceContext, req: RequestContext) {
  const rows = ctx.db.collection<Parcel>(COLLECTION);
  const rng = seededRandom(`land:create:${rows.count()}:${Date.now()}`);
  const draft = { ...makeParcel(rng, rows.count()), ...(req.body as Partial<Parcel>) };
  const created = rows.insert(draft);
  upsertTwin(ctx, created);

  // Everyone who declared an interest in this event hears about it now.
  await ctx.publish(
    'land.parcel.updated.v1',
    {
      parcelId: created.id,
      governorate: created.governorate,
      zoning: created.zoning,
      areaHectares: created.areaHectares,
      ownership: created.ownership,
      updatedAt: nowIso(),
    },
    { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
  );

  return { data: created, synthetic: true };
}
