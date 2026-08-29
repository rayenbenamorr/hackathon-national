# STUDENT GUIDE — Tunisia National Digital Twin

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Tunisia National Digital Twin**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/national-digital-twin/health
curl http://localhost:4000/api/national-digital-twin/regionStates
curl http://localhost:4000/api/national-digital-twin/signals
```

Le troisième appel est le plus important : il montre ce que **22 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Hold the whole picture without owning anyone else data: aggregate references and signals, run scenarios across them, and hand every ministry back the context it cannot see alone.

Trois modules à faire vivre :

1. **Tunisia Digital Twin** — Regional state assembled from every ministry signal.
2. **National Scenario Engine** — What-if simulation across sectors.
3. **Regional AI Planner** — Investment and priority proposals per governorate.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `national-digital-twin` (Tunisia National Digital Twin). Lis
> `services/national-digital-twin/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `national-digital-twin`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `national-digital-twin` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `twin.state.updated.v1` — The national twin recomputed a region state.
- `twin.scenario.completed.v1` — A cross-sector scenario finished running.
- `twin.anomaly.detected.v1` — A region deviates from its own baseline across several sectors at once.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('twin.state.updated.v1', {
  governorate: 'TN-11',
  stressIndex: 0.42,
  drivers: ['drought-index', 'sensor-observations'],
  contributingServices: ['environment', 'health'],
  updatedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

20 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `environment.air-quality.updated.v1` (environment) — Air quality is one of the six axes of the regional state vector.
- `environment.climate-risk.updated.v1` (environment) — Climate risk is the slow variable every scenario is run against.
- `agriculture.water-demand.predicted.v1` (food-water) — Water demand versus supply is the axis that moves every other one.
- `agriculture.water-shortage.predicted.v1` (food-water) — A shortage prediction propagates into health, economy and mobility in the model.
- `health.capacity.updated.v1` (health) — Health load is a direct component of the regional stress index.
- `transport.mobility-demand.updated.v1` (mobility-logistics) — Mobility pressure is a component of the regional stress index.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/national-digital-twin/dependencies   # intégrations en panne
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
