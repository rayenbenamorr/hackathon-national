# STUDENT GUIDE — Tunisia Immersive Tourism OS

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Tunisia Immersive Tourism OS**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/tourism/health
curl http://localhost:4000/api/tourism/sites
curl http://localhost:4000/api/tourism/signals
```

Le troisième appel est le plus important : il montre ce que **15 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Spread visitors instead of concentrating them, using signals the country already produces — and protect the sites that make the visit worth it.

Trois modules à faire vivre :

1. **Tourism Digital Twin** — Site capacity, pressure and seasonality.
2. **AR Tunisia** — Anchored augmented-reality scenes at real sites.
3. **AI Tourism Flow Engine** — Itineraries that redistribute pressure.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `tourism` (Tunisia Immersive Tourism OS). Lis
> `services/tourism/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `tourism`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `tourism` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `tourism.visitor-flow.updated.v1` — Visitor volume at a site or zone.
- `tourism.site-pressure.detected.v1` — A site is over its sustainable capacity.
- `tourism.experience.published.v1` — A new itinerary or AR experience is available.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('tourism.visitor-flow.updated.v1', {
  siteId: 'site_0001',
  governorate: 'TN-11',
  visitorsWeek: 12,
  originMix: ['domestic', 'europe'],
  observedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

16 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `environment.air-quality.updated.v1` (environment) — A bad air day is a bad visit; itineraries route around it.
- `environment.water-quality.updated.v1` (environment) — Bathing water quality decides whether a beach can be recommended at all.
- `environment.climate-risk.updated.v1` (environment) — Heat risk reshapes the summer offer towards inland and evening options.
- `culture.event.scheduled.v1` (culture) — Cultural programming is the primary content of any itinerary.
- `culture.asset-condition.updated.v1` (culture) — A closed or fragile asset must leave the itinerary immediately.
- `heritage.site-condition.updated.v1` (religious-heritage) — Access limits at heritage sites are conservation decisions tourism must honour.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/tourism/dependencies   # intégrations en panne
pnpm doctor                                                 # diagnostic complet
pnpm architecture:check                                     # règles d'architecture
```

Le portail (http://localhost:4000) montre les traces : qui a appelé quoi, dans
quel ordre, et où ça s'est arrêté.

## 8. Les règles / The rules

1. **Ne lisez jamais la base d'un autre service.** C'est structurellement
   impossible ici — passez par son API ou ses événements.
2. **Ne cassez pas un contrat** que vous publiez : ajouter un champ optionnel est
   sûr, tout le reste est une `.v2`.
3. **Données synthétiques uniquement.** Aucune donnée réelle de citoyen.
4. **Aucun secret dans le code.** Les clés vont dans `.env`, jamais dans git.
