# STUDENT GUIDE — Connected Health Intelligence System

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Connected Health Intelligence System**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/health/health
curl http://localhost:4000/api/health/facilities
curl http://localhost:4000/api/health/signals
```

Le troisième appel est le plus important : il montre ce que **20 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Publish capacity continuously so no other ministry has to guess it, and read the environment so that a health event is anticipated rather than counted.

Trois modules à faire vivre :

1. **Personal Health Digital Twin** — Pseudonymous cohort twins — never an identified person.
2. **Smart Hospital Operating System** — Beds, ICU, emergency load, in real time.
3. **Healthcare Mesh** — Coordination with transport, social services and emergency.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `health` (Connected Health Intelligence System). Lis
> `services/health/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `health`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `health` à `digital-nervous-system` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `health.capacity.updated.v1` — Bed and emergency capacity at a facility. Consumed widely — dispatch depends on it.
- `health.epidemic-signal.detected.v1` — An unusual health signal was detected in a governorate.
- `health.emergency.declared.v1` — Health declares an emergency requiring resources it does not own.
- `health.care-episode.updated.v1` — Aggregate care activity for a cohort.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('health.capacity.updated.v1', {
  facilityId: 'facility_0001',
  governorate: 'TN-11',
  location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
  totalBeds: 12,
  availableBeds: 12,
  icuAvailable: 12,
  emergencyLoad: 0.42,
  observedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `environment.air-quality.updated.v1` (environment) — Respiratory admissions follow particulate load with a short, known lag.
- `environment.water-quality.updated.v1` (environment) — Water-borne disease surveillance starts at the water station, not at the ward.
- `environment.climate-risk.updated.v1` (environment) — Heat risk is a direct predictor of emergency load in vulnerable cohorts.
- `iot.sensor.observation.v1` (digital-nervous-system) — Wearable and facility observations feed the cohort and hospital twins.
- `emergency.incident.created.v1` (safety-emergency) — Incoming casualties are known from the incident, before they arrive.
- `transport.resource.dispatched.v1` (mobility-logistics) — The hospital needs the ETA of what is coming to it.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/health/dependencies   # intégrations en panne
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
