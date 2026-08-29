# STUDENT GUIDE — Intelligent Treasury OS

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Intelligent Treasury OS**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/treasury/health
curl http://localhost:4000/api/treasury/budgetLines
curl http://localhost:4000/api/treasury/signals
```

Le troisième appel est le plus important : il montre ce que **21 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Make the budget a live object other ministries can query and react to — so a drought, an outage or an epidemic has a visible fiscal consequence the same day, not the following year.

Trois modules à faire vivre :

1. **Real-Time Treasury Twin** — Live position of every budget line.
2. **AI Public Budget Optimizer** — Reallocation proposals under an explicit constraint.
3. **Smart Aid Wallet** — Targeted, traceable aid disbursement.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `treasury` (Intelligent Treasury OS). Lis
> `services/treasury/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `treasury`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `treasury` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `treasury.budget-line.updated.v1` — A budget line moved.
- `treasury.funding.approved.v1` — Funding was approved for another ministry request.
- `treasury.aid.disbursed.v1` — Targeted aid reached a beneficiary cohort.
- `treasury.fiscal-risk.flagged.v1` — A fiscal risk was detected — over-commitment, shock exposure, revenue gap.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('treasury.budget-line.updated.v1', {
  lineId: 'line_0001',
  programme: 'programme-sample',
  ministry: 'ministry-sample',
  allocatedTnd: 42.5,
  committedTnd: 42.5,
  governorate: 'TN-11',
  updatedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

15 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `resilience.relief-plan.updated.v1` (resilience) — A relief plan is a spending commitment; the treasury twin must see it as it forms.
- `resilience.resource-request.created.v1` (resilience) — Resource requests are funding requests wearing another name.
- `health.capacity.updated.v1` (health) — Saturation is the earliest signal of an unbudgeted health cost.
- `agriculture.water-shortage.predicted.v1` (food-water) — Water shortage has a known fiscal shape: compensation, tankering, import.
- `infrastructure.failure.predicted.v1` (infrastructure) — Predicted failure lets maintenance be budgeted instead of emergency-funded.
- `infrastructure.maintenance.scheduled.v1` (infrastructure) — Scheduled work orders are the committed half of the infrastructure budget.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/treasury/dependencies   # intégrations en panne
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
