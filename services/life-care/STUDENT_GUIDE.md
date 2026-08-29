# STUDENT GUIDE — Life & Care Intelligence OS

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Life & Care Intelligence OS**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/life-care/health
curl http://localhost:4000/api/life-care/facilities
curl http://localhost:4000/api/life-care/signals
```

Le troisième appel est le plus important : il montre ce que **14 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Follow a life journey across the ministries that touch it, so that support arrives at the transition instead of after it.

Trois modules à faire vivre :

1. **Life Journey AI** — Life events and the support each one should trigger.
2. **Smart Care Network** — Care facilities, capacity and coverage.
3. **Economic Independence Engine** — The concrete path from support to autonomy.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `life-care` (Life & Care Intelligence OS). Lis
> `services/life-care/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `life-care`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `life-care` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `care.life-event.recorded.v1` — A life transition was recorded for a cohort.
- `care.support-need.detected.v1` — A support need was inferred from a life event and other ministry signals.
- `care.facility-capacity.updated.v1` — Care facility capacity changed.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('care.life-event.recorded.v1', {
  eventId: 'event_0001',
  cohortId: 'cohort_0001',
  eventType: 'birth',
  governorate: 'TN-11',
  people: 12,
  recordedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `social.vulnerability.updated.v1` (social-mobility) — Vulnerability and care need are the same household from two angles.
- `social.household-need.detected.v1` (social-mobility) — A detected household need usually resolves into a care placement.
- `health.capacity.updated.v1` (health) — Discharge planning is only possible if hospital pressure is visible.
- `health.care-episode.updated.v1` (health) — A care episode ending is where the care network takes over.
- `education.learning-progress.updated.v1` (education) — Schooling is the main childhood life transition the journey tracks.
- `skills.micro-mission.published.v1` (skills-opportunity) — Economic independence is built out of real, paid missions.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/life-care/dependencies   # intégrations en panne
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
