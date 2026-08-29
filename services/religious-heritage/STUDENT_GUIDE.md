# STUDENT GUIDE — Smart Religious Heritage Network

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Smart Religious Heritage Network**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/religious-heritage/health
curl http://localhost:4000/api/religious-heritage/sites
curl http://localhost:4000/api/religious-heritage/signals
```

Le troisième appel est le plus important : il montre ce que **15 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Protect fragile places with sensors instead of inspections, and answer questions about heritage from documented sources only.

Trois modules à faire vivre :

1. **Smart Heritage Sensor Network** — Humidity, strain and vibration on fragile fabric.
2. **Smart Building / Energy System** — Consumption and comfort in places of worship.
3. **Trusted Knowledge Graph** — Sourced, verifiable knowledge — never generated assertion.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `religious-heritage` (Smart Religious Heritage Network). Lis
> `services/religious-heritage/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `religious-heritage`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `religious-heritage` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `heritage.site-condition.updated.v1` — Condition of a heritage site changed.
- `heritage.energy-usage.updated.v1` — Energy consumption at a site.
- `heritage.knowledge.published.v1` — A sourced knowledge entry was published.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('heritage.site-condition.updated.v1', {
  siteId: 'site_0001',
  governorate: 'TN-11',
  conditionIndex: 0.42,
  humidityPct: 42.5,
  vibrationMmS: 42.5,
  observedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

18 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `iot.sensor.observation.v1` (digital-nervous-system) — Humidity, vibration and strain observations are the site condition twin.
- `environment.air-quality.updated.v1` (environment) — Particulates and pollutants are the main slow destroyer of historic fabric.
- `environment.climate-risk.updated.v1` (environment) — Humidity and flood risk decide conservation priority.
- `infrastructure.failure.predicted.v1` (infrastructure) — Historic buildings are infrastructure assets with irreplaceable value.
- `infrastructure.maintenance.scheduled.v1` (infrastructure) — Conservation work is scheduled through the same maintenance system.
- `energy.grid-load.updated.v1` (industrial-energy) — Site energy systems are optimised against the local grid.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/religious-heritage/dependencies   # intégrations en panne
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
