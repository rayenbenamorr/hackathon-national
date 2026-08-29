# STUDENT GUIDE — National Resilience Command System

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **National Resilience Command System**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/resilience/health
curl http://localhost:4000/api/resilience/crises
curl http://localhost:4000/api/resilience/signals
```

Le troisième appel est le plus important : il montre ce que **19 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Hold one shared picture of a crisis across every ministry, and turn it into a relief plan with named resources — because in a crisis the failure is almost never lack of resources, it is lack of a shared picture.

Trois modules à faire vivre :

1. **National Resilience Digital Twin** — Live state of every declared crisis and the zones it covers.
2. **Autonomous Crisis Logistics** — Turns needs into a resourced, sequenced relief plan.
3. **Emergency Mesh Network** — Store-and-forward node health when normal connectivity is gone.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `resilience` (National Resilience Command System). Lis
> `services/resilience/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `resilience`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `resilience` à `digital-nervous-system` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `resilience.crisis.declared.v1` — A crisis is declared — the single signal that reconfigures the whole platform.
- `resilience.relief-plan.updated.v1` — The resourced relief plan for a crisis changed.
- `resilience.resource-request.created.v1` — Resilience needs a resource another ministry controls.
- `resilience.mesh-node.status.v1` — Emergency mesh node reachability.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('resilience.crisis.declared.v1', {
  crisisId: 'crisi_0001',
  kind: 'kind-sample',
  severity: 'severity-sample',
  governorate: 'TN-11',
  location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
  affectedPeople: 12,
  declaredAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `emergency.incident.created.v1` (safety-emergency) — Clustered incidents are how a crisis is first detected, before anyone declares one.
- `environment.climate-risk.updated.v1` (environment) — Drought, heat and flood risk are the leading indicators the command system watches.
- `agriculture.water-shortage.predicted.v1` (food-water) — A predicted water shortage is a slow-onset crisis; declaring early is the whole point.
- `health.capacity.updated.v1` (health) — A relief plan that ignores hospital saturation sends people where they cannot be treated.
- `infrastructure.failure.predicted.v1` (infrastructure) — A predicted bridge or network failure changes every evacuation route.
- `energy.outage-risk.flagged.v1` (industrial-energy) — Power shortfall determines which shelters and hospitals need generators.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/resilience/dependencies   # intégrations en panne
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
