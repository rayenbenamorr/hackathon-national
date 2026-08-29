/**
 * THE SENSOR REGISTRY (§14).
 *
 * One entry per kind of thing the country can measure. A student who wants a
 * new sensor adds a row here — unit, plausible range, daily rhythm — and the
 * simulator, the CLI, the digital twin and the portal all pick it up.
 *
 * `interestedServices` is not routing (the bus does that). It documents which
 * ministries the observation is *about*, which is what the portal draws and
 * what Claude Code reads before wiring a new sensor into the right domains.
 */
export interface SensorKind {
  kind: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  /** Value around which the daily cycle oscillates. */
  baseline: number;
  amplitude: number;
  /** Hours for one full cycle. 24 = daily rhythm, 0 = no cycle. */
  periodHours: number;
  noise: number;
  decimals: number;
  interestedServices: string[];
  description: string;
}

export const SENSOR_KINDS: readonly SensorKind[] = [
  {
    kind: 'water-level',
    label: 'Reservoir / well water level',
    unit: 'm',
    min: 0,
    max: 40,
    baseline: 18,
    amplitude: 2.5,
    periodHours: 168,
    noise: 0.4,
    decimals: 2,
    interestedServices: [
      'food-water',
      'environment',
      'infrastructure',
      'national-digital-twin',
      'resilience',
    ],
    description: 'Depth of stored water in a dam, reservoir or well.',
  },
  {
    kind: 'soil-moisture',
    label: 'Soil moisture',
    unit: '%',
    min: 0,
    max: 100,
    baseline: 32,
    amplitude: 9,
    periodHours: 24,
    noise: 2,
    decimals: 1,
    interestedServices: ['food-water', 'environment', 'land', 'national-digital-twin'],
    description: 'Volumetric water content in the root zone.',
  },
  {
    kind: 'rainfall',
    label: 'Rainfall',
    unit: 'mm',
    min: 0,
    max: 60,
    baseline: 1.2,
    amplitude: 1.2,
    periodHours: 72,
    noise: 1.5,
    decimals: 1,
    interestedServices: ['food-water', 'environment', 'resilience', 'infrastructure', 'mobility-logistics'],
    description: 'Precipitation accumulated over the observation window.',
  },
  {
    kind: 'air-quality',
    label: 'Air quality (PM2.5)',
    unit: 'µg/m³',
    min: 0,
    max: 250,
    baseline: 28,
    amplitude: 14,
    periodHours: 24,
    noise: 5,
    decimals: 1,
    interestedServices: [
      'environment',
      'health',
      'mobility-logistics',
      'industrial-energy',
      'education',
      'tourism',
    ],
    description: 'Fine particulate concentration; the most cross-cutting environmental signal.',
  },
  {
    kind: 'temperature',
    label: 'Ambient temperature',
    unit: '°C',
    min: -5,
    max: 52,
    baseline: 24,
    amplitude: 8,
    periodHours: 24,
    noise: 1,
    decimals: 1,
    interestedServices: [
      'environment',
      'health',
      'food-water',
      'industrial-energy',
      'religious-heritage',
      'culture',
    ],
    description: 'Outdoor or indoor air temperature.',
  },
  {
    kind: 'humidity',
    label: 'Relative humidity',
    unit: '%',
    min: 5,
    max: 100,
    baseline: 55,
    amplitude: 15,
    periodHours: 24,
    noise: 3,
    decimals: 1,
    interestedServices: ['environment', 'food-water', 'religious-heritage', 'culture', 'health'],
    description: 'Air humidity — matters for crops, manuscripts and building health alike.',
  },
  {
    kind: 'traffic-flow',
    label: 'Traffic flow',
    unit: 'veh/h',
    min: 0,
    max: 2400,
    baseline: 700,
    amplitude: 520,
    periodHours: 24,
    noise: 80,
    decimals: 0,
    interestedServices: [
      'mobility-logistics',
      'safety-emergency',
      'environment',
      'infrastructure',
      'tourism',
    ],
    description: 'Vehicles crossing a section per hour.',
  },
  {
    kind: 'energy-load',
    label: 'Electrical load',
    unit: 'MW',
    min: 0,
    max: 900,
    baseline: 320,
    amplitude: 130,
    periodHours: 24,
    noise: 18,
    decimals: 1,
    interestedServices: [
      'industrial-energy',
      'infrastructure',
      'treasury',
      'environment',
      'national-digital-twin',
    ],
    description: 'Instantaneous demand on a grid node.',
  },
  {
    kind: 'gps-position',
    label: 'Vehicle position',
    unit: 'km',
    min: 0,
    max: 1200,
    baseline: 40,
    amplitude: 30,
    periodHours: 6,
    noise: 8,
    decimals: 2,
    interestedServices: ['mobility-logistics', 'resilience', 'safety-emergency', 'health', 'smart-trade'],
    description: 'Distance travelled by a tracked resource since its last stop.',
  },
  {
    kind: 'occupancy',
    label: 'Occupancy',
    unit: 'people',
    min: 0,
    max: 1500,
    baseline: 240,
    amplitude: 200,
    periodHours: 24,
    noise: 30,
    decimals: 0,
    interestedServices: [
      'tourism',
      'culture',
      'religious-heritage',
      'education',
      'health',
      'talent',
      'safety-emergency',
    ],
    description: 'People present in a site, building or vehicle.',
  },
  {
    kind: 'vibration',
    label: 'Structural vibration',
    unit: 'mm/s',
    min: 0,
    max: 30,
    baseline: 1.8,
    amplitude: 0.9,
    periodHours: 12,
    noise: 0.5,
    decimals: 2,
    interestedServices: [
      'infrastructure',
      'religious-heritage',
      'resilience',
      'industrial-energy',
      'culture',
    ],
    description: 'Velocity amplitude on a structure — the leading indicator of fatigue.',
  },
  {
    kind: 'structural-strain',
    label: 'Structural strain',
    unit: 'µε',
    min: 0,
    max: 2000,
    baseline: 380,
    amplitude: 90,
    periodHours: 24,
    noise: 25,
    decimals: 0,
    interestedServices: ['infrastructure', 'land', 'resilience', 'religious-heritage'],
    description: 'Micro-strain measured on a bridge, dam or heritage wall.',
  },
  {
    kind: 'wearable-heartrate',
    label: 'Wearable heart rate',
    unit: 'bpm',
    min: 38,
    max: 200,
    baseline: 76,
    amplitude: 14,
    periodHours: 24,
    noise: 6,
    decimals: 0,
    interestedServices: ['health', 'talent', 'life-care', 'safety-emergency'],
    description: 'Pseudonymous wearable signal. Never carries an identity — only a device id.',
  },
  {
    kind: 'water-quality',
    label: 'Water turbidity',
    unit: 'NTU',
    min: 0,
    max: 120,
    baseline: 12,
    amplitude: 6,
    periodHours: 48,
    noise: 2.5,
    decimals: 1,
    interestedServices: ['environment', 'food-water', 'health', 'tourism', 'infrastructure'],
    description: 'Cloudiness of water — a proxy for contamination events.',
  },
  {
    kind: 'noise',
    label: 'Acoustic level',
    unit: 'dB(A)',
    min: 25,
    max: 120,
    baseline: 58,
    amplitude: 12,
    periodHours: 24,
    noise: 4,
    decimals: 1,
    interestedServices: ['environment', 'health', 'mobility-logistics', 'tourism', 'culture'],
    description: 'Ambient sound pressure level.',
  },
  {
    kind: 'wind-speed',
    label: 'Wind speed',
    unit: 'm/s',
    min: 0,
    max: 45,
    baseline: 5.5,
    amplitude: 3,
    periodHours: 24,
    noise: 1.5,
    decimals: 1,
    interestedServices: [
      'environment',
      'industrial-energy',
      'resilience',
      'mobility-logistics',
      'food-water',
    ],
    description: 'Wind at 10 m — drives renewable generation and fire risk alike.',
  },
] as const;

const BY_KIND = new Map(SENSOR_KINDS.map((k) => [k.kind, k]));

export function sensorKind(kind: string): SensorKind | undefined {
  return BY_KIND.get(kind);
}

export function sensorKindNames(): string[] {
  return SENSOR_KINDS.map((k) => k.kind);
}
