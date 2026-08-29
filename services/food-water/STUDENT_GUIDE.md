# STUDENT GUIDE — Autonomous Food & Water Grid

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Autonomous Food & Water Grid**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/food-water/health
curl http://localhost:4000/api/food-water/farms
curl http://localhost:4000/api/food-water/signals
```

Le troisième appel est le plus important : il montre ce que **15 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Turn water from a resource that is discovered to be missing into a resource that is forecast — and make that forecast reach the ministries whose plans depend on it.

Trois modules à faire vivre :

1. **Autonomous Water Grid** — Reservoirs, networks and demand as one balance.
2. **AI Farm Digital Twin** — Soil, crop and irrigation state per farm.
3. **Smart Ocean & Fisheries Network** — Stock and effort per fishing zone.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `food-water` (Autonomous Food & Water Grid). Lis
> `services/food-water/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `food-water`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `food-water` à `digital-nervous-system` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `agriculture.water-demand.predicted.v1` — Forecast water demand for a zone — the canonical cross-ministry forecast on this platform.
- `agriculture.water-shortage.predicted.v1` — A shortage is expected: demand will exceed available supply.
- `agriculture.yield.forecast.v1` — Expected yield for a crop in a governorate.
- `water.reservoir-level.updated.v1` — Reservoir fill level changed.
- `fisheries.stock.updated.v1` — Stock and fishing effort for a maritime zone.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('agriculture.water-demand.predicted.v1', {
  forecastId: 'forecast_0001',
  governorate: 'TN-11',
  horizonDays: 12,
  demandM3Day: 42.5,
  confidence: 0.42,
  drivers: ['drought-index', 'sensor-observations'],
  predictedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `environment.climate-risk.updated.v1` (environment) — Drought index is the dominant term in every water demand forecast.
- `environment.water-quality.updated.v1` (environment) — Unusable water is not supply; quality belongs in the balance.
- `environment.air-quality.updated.v1` (environment) — Heat and particulate load affect evapotranspiration and crop stress.
- `iot.sensor.observation.v1` (digital-nervous-system) — Soil moisture, rainfall and reservoir level are the farm and water twins.
- `infrastructure.failure.predicted.v1` (infrastructure) — A failing water network turns available water into unavailable water.
- `energy.outage-risk.flagged.v1` (industrial-energy) — Irrigation is pumping; no power is no irrigation.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/food-water/dependencies   # intégrations en panne
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
