/**
 * THE HIERARCHY — 6 pôles × 4 ministères.
 *
 * 24 ministries is too many things for a person to hold at once: an organiser
 * scanning a wall of 24 cards sees no structure, and 24 teams with no grouping
 * have nobody natural to compare themselves to.
 *
 * So the 24 are grouped into six pôles of exactly four. The grouping is not
 * cosmetic — it is the unit the event is actually run in:
 *
 *   · a pôle is one mentoring pod (4 teams, one referent),
 *   · a pôle is one demo slot,
 *   · a pôle is the set of ministries whose relations are densest, so the
 *     cross-service integrations a team must build are mostly with neighbours
 *     they can walk over to.
 *
 * Four levels, top to bottom:
 *
 *   Pôle (6)  →  Ministère (24)  →  Module (72)  →  Écran / endpoint (240)
 */

export const POLES = [
  {
    id: 'souverainete',
    name: 'Souveraineté & Sécurité',
    tagline: "Ce qui protège l'État et les personnes.",
    colour: '#f2555a',
    services: ['justice', 'safety-emergency', 'resilience', 'global-tunisia'],
  },
  {
    id: 'ressources',
    name: 'Ressources & Environnement',
    tagline: 'Ce que le pays consomme, produit et doit préserver.',
    colour: '#4ade80',
    services: ['food-water', 'environment', 'industrial-energy', 'land'],
  },
  {
    id: 'territoire',
    name: 'Territoire & Réseaux',
    tagline: 'Ce qui relie physiquement et numériquement le territoire.',
    colour: '#5eead4',
    services: ['infrastructure', 'mobility-logistics', 'digital-nervous-system', 'national-digital-twin'],
  },
  {
    id: 'solidarites',
    name: 'Santé & Solidarités',
    tagline: 'Ce qui prend soin des personnes tout au long de la vie.',
    colour: '#a78bfa',
    services: ['health', 'social-mobility', 'life-care', 'skills-opportunity'],
  },
  {
    id: 'savoir',
    name: 'Savoir & Transmission',
    tagline: 'Ce qui forme, cherche et transmet.',
    colour: '#f5a524',
    services: ['education', 'research', 'talent', 'religious-heritage'],
  },
  {
    id: 'economie',
    name: 'Économie & Rayonnement',
    tagline: "Ce qui crée de la valeur et porte le pays à l'extérieur.",
    colour: '#60a5fa',
    services: ['treasury', 'smart-trade', 'tourism', 'culture'],
  },
];

/** Validated by the generator; a mistake here is a mistake in every screen. */
export function validatePoles(serviceIds) {
  const placed = POLES.flatMap((p) => p.services);

  const duplicate = placed.find((id, i) => placed.indexOf(id) !== i);
  if (duplicate) throw new Error(`"${duplicate}" appears in two pôles.`);

  const missing = serviceIds.filter((id) => !placed.includes(id));
  if (missing.length) throw new Error(`Not placed in any pôle: ${missing.join(', ')}`);

  const unknown = placed.filter((id) => !serviceIds.includes(id));
  if (unknown.length) throw new Error(`Pôle references unknown service(s): ${unknown.join(', ')}`);

  const uneven = POLES.filter((p) => p.services.length !== 4);
  if (uneven.length) {
    throw new Error(`Every pôle holds exactly 4 ministries; wrong: ${uneven.map((p) => p.id).join(', ')}`);
  }
  return true;
}

export function poleOf(serviceId) {
  return POLES.find((p) => p.services.includes(serviceId));
}
