# STUDENT GUIDE — Environmental Nervous System

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Environmental Nervous System**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/environment/health
curl http://localhost:4000/api/environment/stations
curl http://localhost:4000/api/environment/signals
```

Le troisième appel est le plus important : il montre ce que **19 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Publish environmental truth continuously and early enough that other ministries can act on it rather than report it.

Trois modules à faire vivre :

1. **National Environmental Sensor Network** — Air, water and noise observations everywhere.
2. **Climate Digital Twin** — Projections and climate risk per zone.
3. **Circular Resource AI** — Waste streams and their possible reuse.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `environment` (Environmental Nervous System). Lis
> `services/environment/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `environment`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `environment` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `environment.air-quality.updated.v1` — Air quality at a station. Health, Education, Mobility and Tourism all react to it.
- `environment.water-quality.updated.v1` — Water quality at a station.
- `environment.climate-risk.updated.v1` — Climate risk for a zone: drought, heat, flood.
- `environment.waste-stream.updated.v1` — A waste stream volume or composition changed.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('environment.air-quality.updated.v1', {
  stationId: 'station_0001',
  governorate: 'TN-11',
  location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
  pm25: 42.5,
  no2: 42.5,
  airQualityIndex: 42.5,
  observedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

15 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `iot.sensor.observation.v1` (digital-nervous-system) — Air, water, noise and weather observations ARE the environmental network.
- `industry.production.updated.v1` (industrial-energy) — Industrial output is the main attributable source of emissions.
- `energy.grid-load.updated.v1` (industrial-energy) — Generation mix decides the emission intensity of every kilowatt-hour.
- `transport.mobility-demand.updated.v1` (mobility-logistics) — Traffic is the second attributable source of urban air pollution.
- `transport.congestion.detected.v1` (mobility-logistics) — Congestion multiplies emissions per kilometre travelled.
- `agriculture.water-demand.predicted.v1` (food-water) — Abstraction is the largest pressure on the water balance.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/environment/dependencies   # intégrations en panne
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
