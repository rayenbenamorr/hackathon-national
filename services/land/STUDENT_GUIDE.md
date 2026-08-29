# STUDENT GUIDE — National Land Intelligence System

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **National Land Intelligence System**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/land/health
curl http://localhost:4000/api/land/parcels
curl http://localhost:4000/api/land/signals
```

Le troisième appel est le plus important : il montre ce que **18 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Answer "can this be built here, and should it" with evidence from every other ministry rather than with a map alone.

Trois modules à faire vivre :

1. **Tunisia Land Digital Twin** — Parcels, zoning and current use.
2. **AI Site Planner** — Multi-criteria site suitability scoring.
3. **Public Asset Intelligence** — What the State owns and whether it is used.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `land` (National Land Intelligence System). Lis
> `services/land/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `land`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `land` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `land.parcel.updated.v1` — A parcel record changed.
- `land.zoning.changed.v1` — Zoning changed — several ministries must re-plan.
- `land.site-suitability.scored.v1` — A site was scored for a proposed use.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('land.parcel.updated.v1', {
  parcelId: 'parcel_0001',
  governorate: 'TN-11',
  zoning: 'zoning-sample',
  areaHectares: 42.5,
  ownership: 'ownership-sample',
  updatedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `environment.climate-risk.updated.v1` (environment) — Flood and drought risk are hard constraints on any siting score.
- `environment.air-quality.updated.v1` (environment) — Air quality is a constraint on residential and school siting.
- `agriculture.water-demand.predicted.v1` (food-water) — Water availability decides whether agricultural zoning is viable.
- `agriculture.water-shortage.predicted.v1` (food-water) — A shortage forecast should freeze water-intensive siting decisions.
- `infrastructure.asset-health.updated.v1` (infrastructure) — A site is only suitable if the networks reaching it are.
- `transport.mobility-demand.updated.v1` (mobility-logistics) — Accessibility is one of the strongest terms in a suitability score.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/land/dependencies   # intégrations en panne
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
