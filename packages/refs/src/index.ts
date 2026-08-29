/**
 * NATIONAL SHARED REFERENCE OBJECTS
 * =================================
 *
 * §12 of the brief. These are the only shapes the 24 services agree on.
 *
 * The rule that keeps this from becoming a giant shared database:
 *
 *   A reference carries an IDENTIFIER and the metadata EVERY service needs to
 *   route, join or display it. It never carries domain data.
 *
 * `HospitalRef` says *which* hospital and *where*. What happened inside it
 * belongs to `services/health` and travels only through health's own API and
 * events. If you find yourself wanting to add a field here "because two
 * services need it", you almost certainly want an event instead.
 *
 * Everything in this platform is SYNTHETIC. Every reference says so, in the
 * data, so that a screenshot can never be mistaken for real national data.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

export const SyntheticFlag = z
  .boolean()
  .default(true)
  .describe('Always true on this platform. Real datasets would set it to false.');

export const RefBase = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  synthetic: SyntheticFlag,
  updatedAt: z.string().datetime().optional(),
});

// ---------------------------------------------------------------------------
// Geography — the spine. Almost every ministry is geographic.
// ---------------------------------------------------------------------------

export const GeoLocation = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  /** Tunisian governorate code, e.g. "TN-11" (Tunis) — see @platform/geo. */
  governorate: z.string().optional(),
  delegation: z.string().optional(),
});
export type GeoLocation = z.infer<typeof GeoLocation>;

export const GeoZone = RefBase.extend({
  kind: z.enum(['governorate', 'delegation', 'municipality', 'watershed', 'corridor', 'custom']),
  /** GeoJSON Polygon / MultiPolygon. Kept loose on purpose: students paste real GeoJSON. */
  geometry: z.record(z.string(), z.unknown()).optional(),
  centroid: GeoLocation.optional(),
  populationEstimate: z.number().int().nonnegative().optional(),
});
export type GeoZone = z.infer<typeof GeoZone>;

// ---------------------------------------------------------------------------
// People and organisations
// ---------------------------------------------------------------------------

/**
 * PRIVACY-SAFE BY CONSTRUCTION.
 *
 * There is no name, no national ID, no address, no date of birth — and there
 * never will be. A citizen is a pseudonymous id plus the coarse attributes a
 * public-policy simulation actually needs. §15 of the brief: "citizens only
 * through privacy-safe abstractions".
 */
export const CitizenRef = z.object({
  id: z.string().regex(/^citizen_/, 'Citizen references must be pseudonymous ids (citizen_…).'),
  ageBand: z.enum(['0-14', '15-24', '25-39', '40-59', '60-74', '75+']),
  governorate: z.string(),
  householdId: z.string().optional(),
  synthetic: SyntheticFlag,
});
export type CitizenRef = z.infer<typeof CitizenRef>;

export const OrganizationRef = RefBase.extend({
  kind: z.enum(['public', 'private', 'ngo', 'academic', 'international', 'cooperative']),
  sector: z.string().optional(),
  location: GeoLocation.optional(),
});
export type OrganizationRef = z.infer<typeof OrganizationRef>;

// ---------------------------------------------------------------------------
// Assets and land
// ---------------------------------------------------------------------------

export const LandParcelRef = RefBase.extend({
  areaHectares: z.number().nonnegative(),
  zoning: z.enum([
    'agricultural',
    'residential',
    'industrial',
    'protected',
    'touristic',
    'public',
    'unzoned',
  ]),
  location: GeoLocation,
  ownership: z.enum(['public', 'private', 'collective', 'unknown']).default('unknown'),
});
export type LandParcelRef = z.infer<typeof LandParcelRef>;

export const InfrastructureAssetRef = RefBase.extend({
  assetType: z.enum([
    'road',
    'bridge',
    'water-network',
    'sewage',
    'power-line',
    'substation',
    'port',
    'airport',
    'rail',
    'building',
    'dam',
    'telecom-site',
  ]),
  location: GeoLocation,
  commissionedYear: z.number().int().optional(),
  criticality: z.enum(['low', 'medium', 'high', 'vital']).default('medium'),
});
export type InfrastructureAssetRef = z.infer<typeof InfrastructureAssetRef>;

export const ResourceRef = RefBase.extend({
  resourceType: z.enum([
    'ambulance',
    'fire-truck',
    'bus',
    'truck',
    'drone',
    'boat',
    'medical-team',
    'shelter',
    'water-tanker',
    'generator',
    'bed',
    'volunteer-team',
  ]),
  status: z.enum(['available', 'engaged', 'maintenance', 'offline']).default('available'),
  location: GeoLocation.optional(),
  capacity: z.number().nonnegative().optional(),
  operatedBy: z.string().optional(),
});
export type ResourceRef = z.infer<typeof ResourceRef>;

export const ProjectRef = RefBase.extend({
  status: z.enum(['proposed', 'approved', 'active', 'suspended', 'completed', 'cancelled']),
  sector: z.string(),
  location: GeoLocation.optional(),
  budgetTnd: z.number().nonnegative().optional(),
  ownerOrganizationId: z.string().optional(),
});
export type ProjectRef = z.infer<typeof ProjectRef>;

export const FinancialProgramRef = RefBase.extend({
  fiscalYear: z.number().int(),
  allocatedTnd: z.number().nonnegative(),
  committedTnd: z.number().nonnegative().default(0),
  ministry: z.string(),
  instrument: z.enum(['budget-line', 'grant', 'subsidy', 'loan', 'guarantee', 'aid-wallet']),
});
export type FinancialProgramRef = z.infer<typeof FinancialProgramRef>;

export const ProductRef = RefBase.extend({
  hsCode: z.string().optional().describe('Harmonised System code, when the product is traded.'),
  category: z.string(),
  originGovernorate: z.string().optional(),
  producerOrganizationId: z.string().optional(),
});
export type ProductRef = z.infer<typeof ProductRef>;

// ---------------------------------------------------------------------------
// Knowledge, skills, research
// ---------------------------------------------------------------------------

export const SkillRef = RefBase.extend({
  domain: z.string(),
  level: z.enum(['awareness', 'practitioner', 'advanced', 'expert']).default('practitioner'),
  esco: z.string().optional().describe('External taxonomy code, when mapped.'),
});
export type SkillRef = z.infer<typeof SkillRef>;

export const ResearchProjectRef = RefBase.extend({
  discipline: z.string(),
  status: z.enum(['proposed', 'running', 'completed', 'transferred']),
  institutionId: z.string().optional(),
  trl: z.number().int().min(1).max(9).optional().describe('Technology Readiness Level.'),
});
export type ResearchProjectRef = z.infer<typeof ResearchProjectRef>;

export const EducationProgramRef = RefBase.extend({
  level: z.enum(['primary', 'secondary', 'vocational', 'undergraduate', 'graduate', 'lifelong']),
  discipline: z.string(),
  institutionId: z.string().optional(),
  durationMonths: z.number().int().positive().optional(),
});
export type EducationProgramRef = z.infer<typeof EducationProgramRef>;

// ---------------------------------------------------------------------------
// Culture and tourism
// ---------------------------------------------------------------------------

export const CulturalAssetRef = RefBase.extend({
  assetType: z.enum(['monument', 'museum', 'manuscript', 'craft', 'performance', 'site', 'archive']),
  location: GeoLocation.optional(),
  period: z.string().optional(),
  protectionStatus: z.enum(['none', 'national', 'unesco', 'at-risk']).default('none'),
});
export type CulturalAssetRef = z.infer<typeof CulturalAssetRef>;

export const TourismAssetRef = RefBase.extend({
  assetType: z.enum(['hotel', 'beach', 'medina', 'archaeological', 'oasis', 'trail', 'festival', 'museum']),
  location: GeoLocation,
  capacity: z.number().int().nonnegative().optional(),
  seasonality: z.enum(['year-round', 'summer', 'winter', 'event']).default('year-round'),
});
export type TourismAssetRef = z.infer<typeof TourismAssetRef>;

// ---------------------------------------------------------------------------
// Incidents and health capacity
// ---------------------------------------------------------------------------

export const IncidentRef = RefBase.extend({
  incidentType: z.enum([
    'road-accident',
    'fire',
    'flood',
    'earthquake',
    'medical',
    'industrial',
    'power-outage',
    'water-outage',
    'security',
    'environmental',
    'other',
  ]),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']),
  location: GeoLocation,
  status: z.enum(['open', 'dispatched', 'contained', 'resolved']).default('open'),
  declaredAt: z.string().datetime(),
});
export type IncidentRef = z.infer<typeof IncidentRef>;

export const HealthCapacity = z.object({
  facilityId: z.string(),
  facilityLabel: z.string(),
  location: GeoLocation,
  totalBeds: z.number().int().nonnegative(),
  availableBeds: z.number().int().nonnegative(),
  icuAvailable: z.number().int().nonnegative(),
  emergencyLoad: z.number().min(0).max(1).describe('0 = empty, 1 = saturated.'),
  observedAt: z.string().datetime(),
  synthetic: SyntheticFlag,
});
export type HealthCapacity = z.infer<typeof HealthCapacity>;

// ---------------------------------------------------------------------------
// Sensing — the IoT spine
// ---------------------------------------------------------------------------

export const SensorRef = RefBase.extend({
  sensorKind: z.string().describe('See @platform/iot SENSOR_KINDS for the registry.'),
  location: GeoLocation,
  unit: z.string(),
  ownerService: z.string(),
  mode: z.enum(['simulated', 'physical']).default('simulated'),
  /** Set when a real device is later attached through packages/iot adapters. */
  deviceId: z.string().optional(),
});
export type SensorRef = z.infer<typeof SensorRef>;

export const SensorObservation = z.object({
  observationId: z.string(),
  sensorId: z.string(),
  sensorKind: z.string(),
  value: z.number(),
  unit: z.string(),
  location: GeoLocation,
  observedAt: z.string().datetime(),
  quality: z.enum(['good', 'degraded', 'suspect']).default('good'),
  synthetic: SyntheticFlag,
});
export type SensorObservation = z.infer<typeof SensorObservation>;

export const EnvironmentalObservation = z.object({
  observationId: z.string(),
  metric: z.enum(['pm25', 'pm10', 'no2', 'o3', 'co2', 'temperature', 'humidity', 'noise', 'water-turbidity']),
  value: z.number(),
  unit: z.string(),
  location: GeoLocation,
  observedAt: z.string().datetime(),
  synthetic: SyntheticFlag,
});
export type EnvironmentalObservation = z.infer<typeof EnvironmentalObservation>;

export const EnergyObservation = z.object({
  observationId: z.string(),
  nodeId: z.string(),
  metric: z.enum(['load-mw', 'generation-mw', 'voltage', 'frequency', 'renewable-share']),
  value: z.number(),
  unit: z.string(),
  location: GeoLocation.optional(),
  observedAt: z.string().datetime(),
  synthetic: SyntheticFlag,
});
export type EnergyObservation = z.infer<typeof EnergyObservation>;

export const WaterObservation = z.object({
  observationId: z.string(),
  assetId: z.string(),
  metric: z.enum([
    'level-m',
    'flow-ls',
    'pressure-bar',
    'salinity-gl',
    'soil-moisture-pct',
    'reservoir-fill-pct',
  ]),
  value: z.number(),
  unit: z.string(),
  location: GeoLocation,
  observedAt: z.string().datetime(),
  synthetic: SyntheticFlag,
});
export type WaterObservation = z.infer<typeof WaterObservation>;

export const MobilityFlow = z.object({
  flowId: z.string(),
  originZone: z.string(),
  destinationZone: z.string(),
  mode: z.enum(['walk', 'car', 'bus', 'rail', 'freight', 'air', 'sea', 'micro']),
  volume: z.number().nonnegative().describe('Trips or tonnes per observation window.'),
  windowStart: z.string().datetime(),
  windowMinutes: z.number().int().positive(),
  congestionIndex: z.number().min(0).max(1).optional(),
  synthetic: SyntheticFlag,
});
export type MobilityFlow = z.infer<typeof MobilityFlow>;

// ---------------------------------------------------------------------------
// Registry — used by the architecture validator and the student portal.
// ---------------------------------------------------------------------------

export const SHARED_REFS = {
  GeoLocation,
  GeoZone,
  CitizenRef,
  OrganizationRef,
  LandParcelRef,
  InfrastructureAssetRef,
  ResourceRef,
  ProjectRef,
  FinancialProgramRef,
  ProductRef,
  SkillRef,
  ResearchProjectRef,
  EducationProgramRef,
  CulturalAssetRef,
  TourismAssetRef,
  IncidentRef,
  HealthCapacity,
  SensorRef,
  SensorObservation,
  EnvironmentalObservation,
  EnergyObservation,
  WaterObservation,
  MobilityFlow,
} as const;

export type SharedRefName = keyof typeof SHARED_REFS;
export const SHARED_REF_NAMES = Object.keys(SHARED_REFS) as SharedRefName[];
