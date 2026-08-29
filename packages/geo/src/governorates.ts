/**
 * The 24 governorates of Tunisia.
 *
 * Codes are ISO 3166-2:TN. Centroids are approximate administrative centres
 * (public geographic knowledge, no licensed dataset). Populations are ROUNDED,
 * ORDER-OF-MAGNITUDE figures used only to make synthetic data plausible — they
 * are not statistics and must never be presented as such.
 *
 * A pleasant coincidence the organisers use: 24 governorates, 24 ministries.
 */
export interface Governorate {
  code: string;
  name: string;
  nameAr: string;
  lat: number;
  lon: number;
  region: 'nord-est' | 'nord-ouest' | 'centre-est' | 'centre-ouest' | 'sud-est' | 'sud-ouest';
  approxPopulation: number;
  coastal: boolean;
}

export const GOVERNORATES: readonly Governorate[] = [
  {
    code: 'TN-11',
    name: 'Tunis',
    nameAr: 'تونس',
    lat: 36.8065,
    lon: 10.1815,
    region: 'nord-est',
    approxPopulation: 1050000,
    coastal: true,
  },
  {
    code: 'TN-12',
    name: 'Ariana',
    nameAr: 'أريانة',
    lat: 36.8625,
    lon: 10.1956,
    region: 'nord-est',
    approxPopulation: 600000,
    coastal: true,
  },
  {
    code: 'TN-13',
    name: 'Ben Arous',
    nameAr: 'بن عروس',
    lat: 36.7533,
    lon: 10.2189,
    region: 'nord-est',
    approxPopulation: 700000,
    coastal: true,
  },
  {
    code: 'TN-14',
    name: 'Manouba',
    nameAr: 'منوبة',
    lat: 36.8081,
    lon: 10.0972,
    region: 'nord-est',
    approxPopulation: 400000,
    coastal: false,
  },
  {
    code: 'TN-21',
    name: 'Nabeul',
    nameAr: 'نابل',
    lat: 36.4513,
    lon: 10.7357,
    region: 'nord-est',
    approxPopulation: 830000,
    coastal: true,
  },
  {
    code: 'TN-22',
    name: 'Zaghouan',
    nameAr: 'زغوان',
    lat: 36.4029,
    lon: 10.1429,
    region: 'nord-est',
    approxPopulation: 180000,
    coastal: false,
  },
  {
    code: 'TN-23',
    name: 'Bizerte',
    nameAr: 'بنزرت',
    lat: 37.2744,
    lon: 9.8739,
    region: 'nord-est',
    approxPopulation: 600000,
    coastal: true,
  },
  {
    code: 'TN-31',
    name: 'Béja',
    nameAr: 'باجة',
    lat: 36.7256,
    lon: 9.1817,
    region: 'nord-ouest',
    approxPopulation: 300000,
    coastal: false,
  },
  {
    code: 'TN-32',
    name: 'Jendouba',
    nameAr: 'جندوبة',
    lat: 36.5011,
    lon: 8.7803,
    region: 'nord-ouest',
    approxPopulation: 400000,
    coastal: true,
  },
  {
    code: 'TN-33',
    name: 'Le Kef',
    nameAr: 'الكاف',
    lat: 36.1826,
    lon: 8.7148,
    region: 'nord-ouest',
    approxPopulation: 240000,
    coastal: false,
  },
  {
    code: 'TN-34',
    name: 'Siliana',
    nameAr: 'سليانة',
    lat: 36.0849,
    lon: 9.3708,
    region: 'nord-ouest',
    approxPopulation: 220000,
    coastal: false,
  },
  {
    code: 'TN-41',
    name: 'Kairouan',
    nameAr: 'القيروان',
    lat: 35.6781,
    lon: 10.0963,
    region: 'centre-ouest',
    approxPopulation: 570000,
    coastal: false,
  },
  {
    code: 'TN-42',
    name: 'Kasserine',
    nameAr: 'القصرين',
    lat: 35.1676,
    lon: 8.8365,
    region: 'centre-ouest',
    approxPopulation: 440000,
    coastal: false,
  },
  {
    code: 'TN-43',
    name: 'Sidi Bouzid',
    nameAr: 'سيدي بوزيد',
    lat: 35.0382,
    lon: 9.4849,
    region: 'centre-ouest',
    approxPopulation: 430000,
    coastal: false,
  },
  {
    code: 'TN-51',
    name: 'Sousse',
    nameAr: 'سوسة',
    lat: 35.8256,
    lon: 10.6369,
    region: 'centre-est',
    approxPopulation: 730000,
    coastal: true,
  },
  {
    code: 'TN-52',
    name: 'Monastir',
    nameAr: 'المنستير',
    lat: 35.7643,
    lon: 10.8113,
    region: 'centre-est',
    approxPopulation: 580000,
    coastal: true,
  },
  {
    code: 'TN-53',
    name: 'Mahdia',
    nameAr: 'المهدية',
    lat: 35.5047,
    lon: 11.0622,
    region: 'centre-est',
    approxPopulation: 420000,
    coastal: true,
  },
  {
    code: 'TN-61',
    name: 'Sfax',
    nameAr: 'صفاقس',
    lat: 34.7406,
    lon: 10.7603,
    region: 'centre-est',
    approxPopulation: 1000000,
    coastal: true,
  },
  {
    code: 'TN-71',
    name: 'Gafsa',
    nameAr: 'قفصة',
    lat: 34.425,
    lon: 8.7842,
    region: 'sud-ouest',
    approxPopulation: 340000,
    coastal: false,
  },
  {
    code: 'TN-72',
    name: 'Tozeur',
    nameAr: 'توزر',
    lat: 33.9197,
    lon: 8.1335,
    region: 'sud-ouest',
    approxPopulation: 110000,
    coastal: false,
  },
  {
    code: 'TN-73',
    name: 'Kébili',
    nameAr: 'قبلي',
    lat: 33.7044,
    lon: 8.969,
    region: 'sud-ouest',
    approxPopulation: 160000,
    coastal: false,
  },
  {
    code: 'TN-81',
    name: 'Gabès',
    nameAr: 'قابس',
    lat: 33.8815,
    lon: 10.0982,
    region: 'sud-est',
    approxPopulation: 390000,
    coastal: true,
  },
  {
    code: 'TN-82',
    name: 'Médenine',
    nameAr: 'مدنين',
    lat: 33.3549,
    lon: 10.5055,
    region: 'sud-est',
    approxPopulation: 480000,
    coastal: true,
  },
  {
    code: 'TN-83',
    name: 'Tataouine',
    nameAr: 'تطاوين',
    lat: 32.9297,
    lon: 10.4518,
    region: 'sud-est',
    approxPopulation: 150000,
    coastal: false,
  },
] as const;

export const GOVERNORATE_CODES = GOVERNORATES.map((g) => g.code);

const BY_CODE = new Map(GOVERNORATES.map((g) => [g.code, g]));
const BY_NAME = new Map(GOVERNORATES.map((g) => [g.name.toLowerCase(), g]));

export function governorate(codeOrName: string): Governorate | undefined {
  return BY_CODE.get(codeOrName) ?? BY_NAME.get(codeOrName.toLowerCase());
}

/** Bounding box of the country: [minLon, minLat, maxLon, maxLat]. */
export const TUNISIA_BBOX: [number, number, number, number] = [7.5, 30.2, 11.6, 37.55];
