# STUDENT GUIDE — Social Mobility OS

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Social Mobility OS**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/social-mobility/health
curl http://localhost:4000/api/social-mobility/cohorts
curl http://localhost:4000/api/social-mobility/signals
```

Le troisième appel est le plus important : il montre ce que **16 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Detect need from signals other ministries already produce, instead of waiting for a household to prove it at a counter.

Trois modules à faire vivre :

1. **Social Digital Twin** — Vulnerability per household cohort, continuously updated.
2. **Zero-Form Social Services** — Eligibility computed from existing signals.
3. **Social Mobility AI** — What actually moves a cohort upward, by governorate.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `social-mobility` (Social Mobility OS). Lis
> `services/social-mobility/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `social-mobility`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `social-mobility` à `education` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `social.vulnerability.updated.v1` — A cohort vulnerability index moved.
- `social.benefit.granted.v1` — A benefit was granted to a cohort.
- `social.household-need.detected.v1` — A need was detected from cross-ministry signals before anyone asked.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('social.vulnerability.updated.v1', {
  cohortId: 'cohort_0001',
  governorate: 'TN-11',
  vulnerabilityIndex: 0.42,
  drivers: ['drought-index', 'sensor-observations'],
  size: 12,
  updatedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `health.capacity.updated.v1` (health) — Health access is a component of the vulnerability index.
- `health.epidemic-signal.detected.v1` (health) — An epidemic signal changes which cohorts are exposed and how.
- `education.learning-progress.updated.v1` (education) — Schooling outcomes are a core axis of social mobility.
- `education.school-condition.updated.v1` (education) — A degraded school is a mobility constraint on the cohort around it.
- `agriculture.water-shortage.predicted.v1` (food-water) — Water shortage translates directly into household need in rural cohorts.
- `energy.outage-risk.flagged.v1` (industrial-energy) — Energy insecurity is one of the fastest drivers of household vulnerability.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/social-mobility/dependencies   # intégrations en panne
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
