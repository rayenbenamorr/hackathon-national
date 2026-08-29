# STUDENT GUIDE — Smart Infrastructure OS

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Smart Infrastructure OS**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/infrastructure/health
curl http://localhost:4000/api/infrastructure/assets
curl http://localhost:4000/api/infrastructure/signals
```

Le troisième appel est le plus important : il montre ce que **20 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Replace inspection cycles with condition: every bridge, network and building carries a health score other ministries can plan against.

Trois modules à faire vivre :

1. **National Infrastructure Digital Twin** — Health per asset, continuously.
2. **Predictive Infrastructure Maintenance** — Failure prediction and work orders.
3. **Autonomous Smart Housing** — Public housing comfort, energy and water.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `infrastructure` (Smart Infrastructure OS). Lis
> `services/infrastructure/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `infrastructure`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `infrastructure` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `infrastructure.asset-health.updated.v1` — Health index of an asset changed.
- `infrastructure.failure.predicted.v1` — An asset is predicted to fail within a horizon.
- `infrastructure.maintenance.scheduled.v1` — A work order was scheduled.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('infrastructure.asset-health.updated.v1', {
  assetId: 'asset_0001',
  assetType: 'assetType-sample',
  governorate: 'TN-11',
  healthIndex: 0.42,
  criticality: 'criticality-sample',
  observedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

15 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `iot.sensor.observation.v1` (digital-nervous-system) — Vibration, strain and water-level observations are the asset health index.
- `environment.climate-risk.updated.v1` (environment) — Flood and heat risk are the dominant accelerators of asset degradation.
- `environment.water-quality.updated.v1` (environment) — Water chemistry drives corrosion in networks and structures.
- `transport.mobility-demand.updated.v1` (mobility-logistics) — Load is what wears a road; demand is the load.
- `transport.congestion.detected.v1` (mobility-logistics) — Chronic congestion marks the segments that fail first.
- `emergency.incident.created.v1` (safety-emergency) — Incidents on an asset are the strongest evidence its health index is wrong.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/infrastructure/dependencies   # intégrations en panne
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
