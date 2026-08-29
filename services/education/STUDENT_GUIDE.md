# STUDENT GUIDE — Adaptive Education OS

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Adaptive Education OS**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/education/health
curl http://localhost:4000/api/education/schools
curl http://localhost:4000/api/education/signals
```

Le troisième appel est le plus important : il montre ce que **19 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Adapt what is taught to what the country is measurably about to need, and notice a failing school building before it is a headline.

Trois modules à faire vivre :

1. **Student Learning Twin** — Cohort-level mastery and progression, never a named pupil.
2. **Smart School IoT** — Air quality, occupancy and building condition per school.
3. **National Knowledge Graph** — Concepts, prerequisites and programme coverage.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `education` (Adaptive Education OS). Lis
> `services/education/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `education`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `education` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `education.learning-progress.updated.v1` — Cohort mastery moved for a domain.
- `education.program.updated.v1` — A programme was created or adapted, usually against a detected skill gap.
- `education.school-condition.updated.v1` — Building or environmental condition at a school changed.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('education.learning-progress.updated.v1', {
  cohortId: 'cohort_0001',
  governorate: 'TN-11',
  domain: 'domain-sample',
  masteryIndex: 0.42,
  pupils: 12,
  updatedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `skills.gap.detected.v1` (skills-opportunity) — A detected gap is the reason a programme is adapted; this is the core loop.
- `iot.sensor.observation.v1` (digital-nervous-system) — School air quality, occupancy and temperature are the school twin.
- `environment.air-quality.updated.v1` (environment) — Poor air in a school is a decision to take today, not a statistic.
- `infrastructure.asset-health.updated.v1` (infrastructure) — A school building is an infrastructure asset with a health index.
- `infrastructure.failure.predicted.v1` (infrastructure) — A predicted building failure means relocating pupils, with notice.
- `social.vulnerability.updated.v1` (social-mobility) — Dropout risk is a social signal before it is an academic one.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/education/dependencies   # intégrations en panne
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
