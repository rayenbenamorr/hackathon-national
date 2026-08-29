/**
 * Sovereign IoT Fabric — Tunisia Digital Nervous System
 *
 * Sensor registry and the single national ingest endpoint.
 *
 * This is YOUR code. Edit it freely: the generator never overwrites files under
 * src/. What it will not let you break is the contract of anything you publish.
 */
import { resolveGovernorate } from '@platform/geo';
import { SensorObservation } from '@platform/refs';
import {
  BadRequestError,
  NotFoundError,
  nowIso,
  type Paging,
  type RequestContext,
  type ServiceContext,
} from '@platform/service-kit';
import { COLLECTION, type Sensor } from '../domain.ts';
import { twinIdFor } from '../seed.ts';

export const MODULE = {
  id: 'sovereign-iot-fabric',
  name: 'Sovereign IoT Fabric',
  purpose: 'Sensor registry and the single national ingest endpoint.',
} as const;

/** List every sensor this ministry owns. */
export function listSensors(ctx: ServiceContext, req: RequestContext) {
  const { limit, offset, governorate } = req.query as unknown as Paging;
  const rows = ctx.db.collection<Sensor>(COLLECTION);
  const items = rows.list({
    match: (row) => !governorate || row.governorate === governorate,
    sort: { key: 'label' },
    limit,
    offset,
  });
  return { items, total: rows.count(), limit, offset, synthetic: true };
}

/** One sensor, with its digital twin. */
export function getSensor(ctx: ServiceContext, req: RequestContext) {
  const row = ctx.db.collection<Sensor>(COLLECTION).get(req.params.id);
  if (!row) throw new NotFoundError('Sensor', req.params.id);
  return { data: row, twin: ctx.twins.get(twinIdFor(row)) ?? null, synthetic: true };
}

/**
 * The national sensor ingest endpoint. Real devices and the simulator both POST here.
 *
 * A real ESP32 and `pnpm simulate:sensor` are indistinguishable here — both
 * POST the same body to the same public endpoint. Everything downstream in the
 * country receives what arrives through this one door.
 */
export async function ingestObservations(ctx: ServiceContext, req: RequestContext) {
  const body = req.body as { observations?: SensorObservation[] };
  const observations = body?.observations ?? [];
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new BadRequestError(
      'POST /sensors/observations expects { "observations": [ … ] } with at least one reading.',
    );
  }

  const sensors = ctx.db.collection<Sensor>(COLLECTION);
  const accepted: string[] = [];

  for (const raw of observations.slice(0, 200)) {
    const parsed = SensorObservation.safeParse(raw);
    if (!parsed.success) {
      ctx.log.warn('rejected a malformed observation', {
        problems: parsed.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      continue;
    }
    const observation = parsed.data;
    const governorate = observation.location.governorate ?? resolveGovernorate(observation.location).code;

    // Auto-registration: a device that shows up joins the fabric.
    const known = sensors.get(observation.sensorId);
    if (!known) {
      sensors.upsert({
        id: observation.sensorId,
        label: `${observation.sensorKind} — ${governorate}`,
        sensorKind: observation.sensorKind,
        governorate,
        location: observation.location,
        unit: observation.unit,
        mode: observation.synthetic === false ? 'physical' : 'simulated',
        lastValue: observation.value,
        healthy: observation.quality !== 'suspect',
        synthetic: true,
      });
      await ctx.publish(
        'dns.sensor.registered.v1',
        {
          sensorId: observation.sensorId,
          sensorKind: observation.sensorKind,
          governorate,
          mode: observation.synthetic === false ? 'physical' : 'simulated',
          ownerService: ctx.id,
          registeredAt: nowIso(),
        },
        { traceId: req.trace.traceId },
      );
    } else {
      sensors.update(known.id, { lastValue: observation.value, healthy: observation.quality !== 'suspect' });
    }

    await ctx.publish(
      'iot.sensor.observation.v1',
      {
        observationId: observation.observationId,
        sensorId: observation.sensorId,
        sensorKind: observation.sensorKind,
        value: observation.value,
        unit: observation.unit,
        location: observation.location,
        governorate,
        quality: observation.quality,
        observedAt: observation.observedAt,
      },
      { traceId: req.trace.traceId, correlationId: req.trace.correlationId },
    );

    accepted.push(observation.observationId);
  }

  return { accepted: accepted.length, rejected: observations.length - accepted.length, synthetic: true };
}
