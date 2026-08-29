# STUDENT GUIDE — Justice Intelligence OS

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Justice Intelligence OS**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/justice/health
curl http://localhost:4000/api/justice/cases
curl http://localhost:4000/api/justice/signals
```

Le troisième appel est le plus important : il montre ce que **14 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Make the journey of a case legible end to end: where it is, what it is waiting on, and which court is saturated — so delay becomes a measurable, addressable quantity rather than an anecdote.

Trois modules à faire vivre :

1. **Justice Digital Twin** — A live twin per court: pending load, average delay, saturation.
2. **AI Legal Navigator** — RAG over published legal texts so a citizen question gets a sourced answer.
3. **Smart Justice Workflow** — Case stages, deadlines and the events other ministries need.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `justice` (Justice Intelligence OS). Lis
> `services/justice/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `justice`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `justice` à `digital-nervous-system` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `justice.case.filed.v1` — A new case entered the system.
- `justice.case.decided.v1` — A case reached a decision.
- `justice.court-load.updated.v1` — Pending load and saturation for a court.
- `justice.legal-text.published.v1` — A legal text became applicable — other ministries may need to adapt.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('justice.case.filed.v1', {
  caseId: 'case_0001',
  matter: 'matter-sample',
  court: 'court-sample',
  governorate: 'TN-11',
  filedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

13 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `emergency.incident.created.v1` (safety-emergency) — A serious incident becomes a case file; opening it from the incident removes a manual re-entry step.
- `land.zoning.changed.v1` (land) — Zoning changes are the single largest generator of land disputes; the court twin anticipates the load.
- `land.parcel.updated.v1` (land) — Parcel records are evidence in property cases and must be current when a case is heard.
- `social.vulnerability.updated.v1` (social-mobility) — Legal aid is targeted at the cohorts that cannot otherwise reach a court.
- `treasury.budget-line.updated.v1` (treasury) — Court staffing and digitisation move with the justice budget line.
- `trade.supply-risk.flagged.v1` (smart-trade) — Commercial disputes rise with supply failures; the workflow pre-positions commercial chambers.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/justice/dependencies   # intégrations en panne
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
