import { SERVICE_DIRECTORY } from '@platform/contracts';

/**
 * ONE SUBDOMAIN PER MINISTRY.
 *
 *   sante.tukhnanutha.com      → services/health
 *   finances.tukhnanutha.com   → services/treasury
 *   agriculture.tukhnanutha.com→ services/food-water
 *   …24 of them
 *
 * The slug is the ministry THEME in French, because that is what a Tunisian
 * student and a jury member read on a badge — not the English service id the
 * code uses. Both work: `health.tukhnanutha.com` resolves to the same place as
 * `sante.tukhnanutha.com`, so a link written from the code is never wrong.
 *
 * This map is the only place the two vocabularies meet. Everything else in the
 * platform keeps using the service id.
 */
export interface MinistryDomain {
  /** The service id — what the code, the registry and the bus use. */
  service: string;
  /** The DNS label — what people type. ASCII only, no accents. */
  slug: string;
  /** How the ministry is named in French on the portal. */
  label: string;
  /** Other labels that resolve here. The service id is added automatically. */
  aliases: string[];
  /**
   * The accent colour of this ministry's welcome page. One per ministry, all
   * distinct, all readable on the dark background of the portal — a hostname
   * should be recognisable before a single word has loaded.
   */
  accent: string;
  /**
   * The ministry's mark. Emoji, deliberately: a jury laptop, a phone and a
   * student's Linux all have a colour emoji font; none of them have ours.
   */
  icon: string;
  /** One sentence, in French: what this ministry does on the platform. */
  tagline: string;
}

const MAP: Array<Omit<MinistryDomain, 'aliases'> & { aliases?: string[] }> = [
  {
    service: 'justice',
    slug: 'justice',
    label: 'Justice',
    accent: '#7c8cf5',
    icon: '⚖️',
    tagline:
      'Le flux des affaires, le savoir juridique et la capacité des tribunaux comme un seul système observable.',
  },
  {
    service: 'resilience',
    slug: 'resilience',
    label: 'Résilience & Protection civile',
    aliases: ['crise'],
    accent: '#f2555a',
    icon: '🛡️',
    tagline: 'Déclarer la crise, acheminer les secours, et tenir même quand le réseau tombe.',
  },
  {
    service: 'safety-emergency',
    slug: 'securite',
    label: 'Sécurité & Secours',
    aliases: ['urgence'],
    accent: '#ff8f4d',
    icon: '🚨',
    tagline:
      'Incidents, engagement des moyens et risque routier — la boucle la plus rapide de la plateforme.',
  },
  {
    service: 'global-tunisia',
    slug: 'diaspora',
    label: 'Affaires étrangères & Diaspora',
    aliases: ['etranger'],
    accent: '#45b3e0',
    icon: '🌍',
    tagline:
      'La diaspora comme un réseau vivant : charge consulaire, compétences ailleurs, occasions au pays.',
  },
  {
    service: 'treasury',
    slug: 'finances',
    label: 'Finances',
    aliases: ['tresor'],
    accent: '#f0c24b',
    icon: '💰',
    tagline: "Où est l'argent public, où il est engagé, et ce qu'il achète.",
  },
  {
    service: 'national-digital-twin',
    slug: 'jumeau',
    label: 'Jumeau numérique national',
    aliases: ['planification'],
    accent: '#b58cf0',
    icon: '🧬',
    tagline: 'Le pays comme un modèle interrogeable, assemblé à partir de ce que publient les 23 autres.',
  },
  {
    service: 'social-mobility',
    slug: 'social',
    label: 'Affaires sociales',
    accent: '#f2a0c0',
    icon: '🤝',
    tagline: 'La vulnérabilité des foyers, et des aides qui arrivent sans formulaire.',
  },
  {
    service: 'industrial-energy',
    slug: 'industrie',
    label: 'Industrie & Énergie',
    aliases: ['energie'],
    accent: '#ffa62b',
    icon: '⚡',
    tagline:
      "La production, la charge du réseau, et le déchet d'une usine qui devient la matière d'une autre.",
  },
  {
    service: 'smart-trade',
    slug: 'commerce',
    label: 'Commerce & Export',
    aliases: ['export'],
    accent: '#d99356',
    icon: '📦',
    tagline:
      "Passeports produit, accompagnement à l'export, et un graphe d'approvisionnement qui montre où cela cassera.",
  },
  {
    service: 'food-water',
    slug: 'agriculture',
    label: 'Agriculture & Ressources en eau',
    aliases: ['eau'],
    accent: '#8ac765',
    icon: '🌾',
    tagline:
      "L'eau là où elle manque, des exploitations qui connaissent leur état, une pêche qui ne se devine plus.",
  },
  {
    service: 'skills-opportunity',
    slug: 'emploi',
    label: 'Emploi & Formation',
    aliases: ['competences'],
    accent: '#57c9b0',
    icon: '💼',
    tagline: "Ce que le pays sait faire, ce qu'il doit savoir faire, et le plus court chemin entre les deux.",
  },
  {
    service: 'health',
    slug: 'sante',
    label: 'Santé',
    accent: '#4ade80',
    icon: '🏥',
    tagline: "Capacité hospitalière, signaux épidémiques, et des soins qui dépassent les murs de l'hôpital.",
  },
  {
    service: 'education',
    slug: 'education',
    label: 'Éducation',
    accent: '#5aa9f7',
    icon: '🎓',
    tagline:
      "Un jumeau d'apprentissage par cohorte, des écoles qui rendent compte de leur état, un seul graphe de connaissances.",
  },
  {
    service: 'research',
    slug: 'recherche',
    label: 'Enseignement supérieur & Recherche',
    accent: '#7f6ae0',
    icon: '🔬',
    tagline: 'La recherche nationale comme une capacité adressable, et un chemin du résultat au déploiement.',
  },
  {
    service: 'talent',
    slug: 'jeunesse',
    label: 'Jeunesse & Sports',
    aliases: ['sport'],
    accent: '#c3d94e',
    icon: '🏅',
    tagline:
      'Développement des athlètes, usage des équipements et occasions offertes aux jeunes, dans une seule filière.',
  },
  {
    service: 'religious-heritage',
    slug: 'affaires-religieuses',
    label: 'Affaires religieuses',
    aliases: ['culte'],
    accent: '#8fbfa8',
    icon: '🕌',
    tagline:
      'Des sites qui signalent leur état, des bâtiments qui gèrent leur énergie, un savoir dont on connaît la source.',
  },
  {
    service: 'digital-nervous-system',
    slug: 'numerique',
    label: 'Économie numérique',
    aliases: ['iot'],
    accent: '#4fd1e0',
    icon: '📡',
    tagline:
      "La colonne vertébrale : le tissu de capteurs, l'identité, l'annuaire des services et le bus d'événements lui-même.",
  },
  {
    service: 'mobility-logistics',
    slug: 'transport',
    label: 'Transport & Logistique',
    aliases: ['mobilite'],
    accent: '#9fb0c4',
    icon: '🚆',
    tagline:
      "Où se déplacent les personnes et les marchandises, et le véhicule le plus proche qu'on peut envoyer.",
  },
  {
    service: 'infrastructure',
    slug: 'equipement',
    label: 'Équipement & Habitat',
    aliases: ['habitat'],
    accent: '#c98f6b',
    icon: '🏗️',
    tagline: "L'état des ouvrages, la maintenance avant la panne, et un habitat qui se conduit lui-même.",
  },
  {
    service: 'land',
    slug: 'foncier',
    label: 'Domaines de l’État & Affaires foncières',
    aliases: ['domaines'],
    accent: '#b8a06a',
    icon: '🗺️',
    tagline: 'Les parcelles, le zonage, et la question de savoir si un site est vraiment une bonne idée.',
  },
  {
    service: 'environment',
    slug: 'environnement',
    label: 'Environnement',
    aliases: ['climat'],
    accent: '#3fb27f',
    icon: '🌿',
    tagline: "Le pays se perçoit lui-même : air, eau, climat, et l'usage circulaire de ce qui est jeté.",
  },
  {
    service: 'tourism',
    slug: 'tourisme',
    label: 'Tourisme',
    accent: '#e05b8a',
    icon: '🧭',
    tagline:
      "Les flux de visiteurs, la pression sur les sites, et des expériences qui existent avant l'arrivée du visiteur.",
  },
  {
    service: 'life-care',
    slug: 'famille',
    label: 'Famille, Enfance & Séniors',
    aliases: ['solidarite'],
    accent: '#f6b6a0',
    icon: '👪',
    tagline:
      "Les événements de la vie, la capacité de prise en charge, et le chemin vers l'autonomie économique.",
  },
  {
    service: 'culture',
    slug: 'culture',
    label: 'Culture',
    accent: '#cf6fc0',
    icon: '🎭',
    tagline:
      "Le patrimoine culturel, un accès immersif, et une économie créative que l'on peut enfin mesurer.",
  },
];

/**
 * Labels that must never resolve to a ministry: they belong to the group's
 * existing sites, or to infrastructure that will exist one day. Routing one of
 * them at a ministry would silently shadow a real site.
 */
export const RESERVED_LABELS = [
  'www',
  'edu',
  'cdn',
  'api',
  'admin',
  'portal',
  'mail',
  'smtp',
  'imap',
  'ftp',
  'ns1',
  'ns2',
  'app',
  'staging',
  'preview',
  'hackathon',
];

export const MINISTRY_DOMAINS: MinistryDomain[] = MAP.map((entry) => ({
  ...entry,
  aliases: [...new Set([...(entry.aliases ?? []), entry.service])].filter((a) => a !== entry.slug),
}));

// --- consistency, checked at load rather than in a test that may not run -----
{
  const services = Object.keys(SERVICE_DIRECTORY);
  const covered = MINISTRY_DOMAINS.map((d) => d.service);

  const missing = services.filter((id) => !covered.includes(id));
  if (missing.length) {
    throw new Error(`No subdomain declared for: ${missing.join(', ')} (packages/runtime/src/domains.ts).`);
  }

  const unknown = covered.filter((id) => !services.includes(id));
  if (unknown.length) {
    throw new Error(`Subdomain declared for unknown service(s): ${unknown.join(', ')}.`);
  }

  const labels = MINISTRY_DOMAINS.flatMap((d) => [d.slug, ...d.aliases]);
  const duplicate = labels.find((label, i) => labels.indexOf(label) !== i);
  if (duplicate) throw new Error(`Two ministries claim the DNS label "${duplicate}".`);

  const reserved = labels.find((label) => RESERVED_LABELS.includes(label));
  if (reserved) throw new Error(`"${reserved}" is a reserved label and cannot be a ministry subdomain.`);

  // A theme only works if it is unique: two ministries sharing an accent or a
  // mark makes the welcome page lie about which host you are on.
  for (const field of ['accent', 'icon'] as const) {
    const values = MINISTRY_DOMAINS.map((d) => d[field]);
    const twice = values.find((value, i) => values.indexOf(value) !== i);
    if (twice) {
      throw new Error(
        `Two ministries share the ${field} "${twice}" (packages/runtime/src/domains.ts). ` +
          `Each of the 24 needs its own.`,
      );
    }
  }

  const badAccent = MINISTRY_DOMAINS.find((d) => !/^#[0-9a-f]{6}$/.test(d.accent));
  if (badAccent) {
    throw new Error(`"${badAccent.accent}" (${badAccent.slug}) must be a six-digit lowercase hex colour.`);
  }
}

const BY_LABEL = new Map<string, MinistryDomain>();
for (const domain of MINISTRY_DOMAINS) {
  BY_LABEL.set(domain.slug, domain);
  for (const alias of domain.aliases) BY_LABEL.set(alias, domain);
}
const BY_SERVICE = new Map(MINISTRY_DOMAINS.map((d) => [d.service, d]));

export function baseDomain(): string {
  return (process.env.PLATFORM_BASE_DOMAIN ?? 'tukhnanutha.com').toLowerCase().replace(/^\.+|\.+$/g, '');
}

export function domainFor(serviceId: string): MinistryDomain | undefined {
  return BY_SERVICE.get(serviceId);
}

export function ministryUrl(serviceId: string, protocol = 'https'): string | undefined {
  const domain = BY_SERVICE.get(serviceId);
  return domain ? `${protocol}://${domain.slug}.${baseDomain()}` : undefined;
}

/**
 * Which ministry is this request for, judged by the Host header alone?
 *
 * Returns null for the platform root (`tukhnanutha.com`, `www.`, `localhost`),
 * which is the shared portal showing all 24.
 *
 * Two matching rules, in order:
 *   1. exact `<label>.<PLATFORM_BASE_DOMAIN>`  — production
 *   2. first label of any host                 — `sante.localhost:4000`,
 *                                                preview domains, a laptop on
 *                                                a LAN. Same behaviour
 *                                                everywhere, no special case
 *                                                for development.
 */
export function resolveMinistryHost(hostHeader?: string): MinistryDomain | null {
  if (!hostHeader) return null;

  const host = hostHeader.split(',')[0].trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
  if (!host) return null;

  const base = baseDomain();
  if (host === base || host === `www.${base}`) return null;

  if (host.endsWith(`.${base}`)) {
    const label = host.slice(0, -(base.length + 1));
    if (label.includes('.')) return null; // deeper subdomains are not ministries
    if (RESERVED_LABELS.includes(label)) return null;
    return BY_LABEL.get(label) ?? null;
  }

  const [first] = host.split('.');
  if (!first || first === host) return null; // bare "localhost", an IP, …
  if (RESERVED_LABELS.includes(first)) return null;
  return BY_LABEL.get(first) ?? null;
}

/** Every hostname that must exist in DNS, in the order a zone file wants them. */
export function allMinistryHosts(includeAliases = false): string[] {
  const base = baseDomain();
  return MINISTRY_DOMAINS.flatMap((domain) =>
    includeAliases
      ? [`${domain.slug}.${base}`, ...domain.aliases.map((a) => `${a}.${base}`)]
      : [`${domain.slug}.${base}`],
  );
}
