# STUDENT GUIDE — National Skills & Opportunity OS

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **National Skills & Opportunity OS**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/skills-opportunity/health
curl http://localhost:4000/api/skills-opportunity/skills
curl http://localhost:4000/api/skills-opportunity/signals
```

Le troisième appel est le plus important : il montre ce que **15 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Read skill demand from what the other ministries are actually building, and open real missions against the gaps.

Trois modules à faire vivre :

1. **National Skills Graph** — Skills, adjacencies and regional supply.
2. **AI Career Digital Twin** — A path from where a person is to where demand is.
3. **National Micro-Mission Network** — Short, real assignments published against detected gaps.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `skills-opportunity` (National Skills & Opportunity OS). Lis
> `services/skills-opportunity/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `skills-opportunity`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `skills-opportunity` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `skills.gap.detected.v1` — Demand for a skill exceeds regional supply.
- `skills.micro-mission.published.v1` — A short real assignment was opened against a gap.
- `skills.profile.updated.v1` — Regional skill supply moved.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('skills.gap.detected.v1', {
  gapId: 'gap_0001',
  skill: 'skill-sample',
  domain: 'domain-sample',
  governorate: 'TN-11',
  gap: 42.5,
  drivenBy: ['alpha', 'beta'],
  detectedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `education.program.updated.v1` (education) — Programmes are the supply side of the skills graph.
- `education.learning-progress.updated.v1` (education) — Cohort mastery is how supply becomes real rather than enrolled.
- `research.project.published.v1` (research) — Research activity is an advanced-skill demand signal.
- `research.transfer.matched.v1` (research) — A technology transfer creates a specific, datable skill need.
- `industry.production.updated.v1` (industrial-energy) — Industrial activity is the largest single source of skill demand.
- `agriculture.yield.forecast.v1` (food-water) — Agricultural seasons drive predictable seasonal skill demand.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/skills-opportunity/dependencies   # intégrations en panne
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
