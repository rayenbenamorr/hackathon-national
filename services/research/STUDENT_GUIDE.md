# STUDENT GUIDE — Tunisia Research Brain

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Tunisia Research Brain**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/research/health
curl http://localhost:4000/api/research/projects
curl http://localhost:4000/api/research/signals
```

Le troisième appel est le plus important : il montre ce que **17 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Connect what laboratories can already do to what ministries are currently blocked on — the gap between the two is where most public value is lost.

Trois modules à faire vivre :

1. **National Research Brain** — Projects, disciplines, maturity, findings.
2. **Living Lab Tunisia** — Real-territory pilots with instrumented outcomes.
3. **AI Innovation Transfer Engine** — Matches a research result to the ministry that needs it.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `research` (Tunisia Research Brain). Lis
> `services/research/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `research`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `research` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `research.project.published.v1` — A research project was registered or updated.
- `research.finding.released.v1` — A usable result was released.
- `research.transfer.matched.v1` — A result was matched to a ministry need.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('research.project.published.v1', {
  projectId: 'project_0001',
  title: 'title-sample',
  discipline: 'discipline-sample',
  governorate: 'TN-11',
  trl: 12,
  publishedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `skills.gap.detected.v1` (skills-opportunity) — A persistent national gap is a research and training agenda.
- `agriculture.water-shortage.predicted.v1` (food-water) — Water scarcity is the most funded applied research question in the country.
- `environment.climate-risk.updated.v1` (environment) — Climate projections set the agenda of the living labs.
- `health.epidemic-signal.detected.v1` (health) — An epidemic signal is a research trigger with a deadline.
- `industry.symbiosis.matched.v1` (industrial-energy) — Symbiosis matches are process research made concrete.
- `infrastructure.failure.predicted.v1` (infrastructure) — Materials and structural research follows real failure modes.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/research/dependencies   # intégrations en panne
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
