# STUDENT GUIDE — Global Tunisia Network

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Global Tunisia Network**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/global-tunisia/health
curl http://localhost:4000/api/global-tunisia/consulates
curl http://localhost:4000/api/global-tunisia/signals
```

Le troisième appel est le plus important : il montre ce que **15 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Treat Tunisians abroad as a connected part of the national system — a source of skills, investment and demand, not a mailing list.

Trois modules à faire vivre :

1. **Diaspora Intelligence Graph** — Aggregate, privacy-safe picture of skills and presence abroad.
2. **AI Consular Twin** — Consular demand and processing time per post.
3. **Global Opportunity Engine** — Matches opportunities at home to capabilities abroad.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `global-tunisia` (Global Tunisia Network). Lis
> `services/global-tunisia/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `global-tunisia`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `global-tunisia` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `global.consular-request.created.v1` — A consular request was filed abroad.
- `global.opportunity.published.v1` — An opportunity at home is opened to the diaspora.
- `global.diaspora-signal.updated.v1` — Aggregate diaspora signal: skills concentration and investment appetite per country.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('global.consular-request.created.v1', {
  requestId: 'request_0001',
  post: 'post-sample',
  country: 'country-sample',
  requestType: 'passport',
  filedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

16 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `skills.gap.detected.v1` (skills-opportunity) — A national skill gap is exactly what the diaspora is asked to fill.
- `skills.micro-mission.published.v1` (skills-opportunity) — Remote missions are the lowest-friction way to mobilise expertise abroad.
- `research.project.published.v1` (research) — Research projects abroad and at home are matched through the diaspora graph.
- `trade.export-opportunity.detected.v1` (smart-trade) — Export openings are relayed to diaspora networks in the target market.
- `treasury.funding.approved.v1` (treasury) — Funded programmes are the opportunities worth publishing abroad.
- `culture.event.scheduled.v1` (culture) — Cultural programming is the main reason diaspora travel is planned.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/global-tunisia/dependencies   # intégrations en panne
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
