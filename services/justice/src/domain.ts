/**
 * DOMAIN MODEL — Justice Intelligence OS
 *
 * The shapes this ministry OWNS. Anything another ministry needs from here
 * leaves through an API or an event, never through a shared table (§7).
 */
import { z } from 'zod';

export const COLLECTION = 'cases';
export const ENTITY_LABEL = 'Case';

export const Cas = z.object({
  id: z.string(),
  label: z.string(),
  reference: z.string(),
  matter: z.enum(['civil', 'commercial', 'administrative', 'labour', 'family', 'penal']),
  court: z.string(),
  stage: z.enum(['filed', 'instruction', 'hearing', 'deliberation', 'decided', 'appealed']),
  openedAt: z.string(),
  delayDays: z.number().int(),
  complexity: z.number().min(0).max(1),
  governorate: z.string(),
  synthetic: z.boolean().default(true),
});
export type Cas = z.infer<typeof Cas>;

/** Every field optional: POST an empty body and a plausible record is created. */
export const CasInput = Cas.omit({ id: true, synthetic: true }).partial();
export type CasInput = z.infer<typeof CasInput>;

export const MODULES = [
  {
    id: 'justice-digital-twin',
    name: 'Justice Digital Twin',
    purpose: 'A live twin per court: pending load, average delay, saturation.',
  },
  {
    id: 'ai-legal-navigator',
    name: 'AI Legal Navigator',
    purpose: 'RAG over published legal texts so a citizen question gets a sourced answer.',
  },
  {
    id: 'smart-justice-workflow',
    name: 'Smart Justice Workflow',
    purpose: 'Case stages, deadlines and the events other ministries need.',
  },
] as const;

export const PUBLISHES = [
  'justice.case.filed.v1',
  'justice.case.decided.v1',
  'justice.court-load.updated.v1',
  'justice.legal-text.published.v1',
] as const;

export const CONSUMES = [
  'emergency.incident.created.v1',
  'land.zoning.changed.v1',
  'land.parcel.updated.v1',
  'social.vulnerability.updated.v1',
  'treasury.budget-line.updated.v1',
  'trade.supply-risk.flagged.v1',
  'resilience.crisis.declared.v1',
  'health.epidemic-signal.detected.v1',
  'transport.congestion.detected.v1',
  'environment.water-quality.updated.v1',
  'research.finding.released.v1',
  'twin.anomaly.detected.v1',
  'iot.sensor.observation.v1',
] as const;
