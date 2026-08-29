# STUDENT GUIDE — National Talent Intelligence Network

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **National Talent Intelligence Network**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/talent/health
curl http://localhost:4000/api/talent/facilities
curl http://localhost:4000/api/talent/signals
```

Le troisième appel est le plus important : il montre ce que **15 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Find talent where the facilities and the data already are, and stop losing athletes to injuries and gaps nobody was watching.

Trois modules à faire vivre :

1. **Athlete Digital Twin** — Load, performance and injury risk from wearable signals.
2. **Smart Sports Infrastructure Grid** — Facility usage, condition and energy.
3. **Youth Opportunity AI** — Connects young people to missions, training and clubs.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `talent` (National Talent Intelligence Network). Lis
> `services/talent/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `talent`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `talent` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `talent.performance.updated.v1` — Aggregate performance for an athlete cohort.
- `talent.facility-usage.updated.v1` — Usage and condition at a sports facility.
- `talent.injury-risk.flagged.v1` — Training load suggests elevated injury risk for a cohort.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('talent.performance.updated.v1', {
  cohortId: 'cohort_0001',
  discipline: 'discipline-sample',
  governorate: 'TN-11',
  performanceIndex: 0.42,
  athletes: 12,
  updatedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `iot.sensor.observation.v1` (digital-nervous-system) — Wearable and occupancy observations are the athlete and facility twins.
- `health.capacity.updated.v1` (health) — Sports medicine capacity gates both competition and training volume.
- `education.learning-progress.updated.v1` (education) — School sport is where the pipeline actually starts.
- `education.school-condition.updated.v1` (education) — School facilities are the majority of accessible sports infrastructure.
- `environment.air-quality.updated.v1` (environment) — Outdoor training on a high-particulate day is a measurable injury and health risk.
- `environment.climate-risk.updated.v1` (environment) — Heat risk decides whether a session is held at all.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/talent/dependencies   # intégrations en panne
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
