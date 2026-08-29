# STUDENT GUIDE — Autonomous Mobility & Logistics Grid

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Autonomous Mobility & Logistics Grid**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/mobility-logistics/health
curl http://localhost:4000/api/mobility-logistics/resources
curl http://localhost:4000/api/mobility-logistics/signals
```

Le troisième appel est le plus important : il montre ce que **19 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Answer one question faster than anyone else in the country: what is the closest available resource, and how long until it arrives.

Trois modules à faire vivre :

1. **National Mobility Digital Twin** — Flows, congestion and demand by corridor.
2. **V2X Smart Road Grid** — Road-side signals and vehicle-to-infrastructure messages.
3. **Autonomous Logistics Brain** — Freight planning and resource dispatch.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `mobility-logistics` (Autonomous Mobility & Logistics Grid). Lis
> `services/mobility-logistics/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `mobility-logistics`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `mobility-logistics` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `transport.mobility-demand.updated.v1` — Demand and congestion on a corridor.
- `transport.resource.dispatched.v1` — A resource was assigned to a request from another ministry.
- `transport.congestion.detected.v1` — Congestion crossed a threshold on a corridor.
- `logistics.freight.updated.v1` — A freight movement changed state.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('transport.mobility-demand.updated.v1', {
  corridorId: 'corridor_0001',
  governorate: 'TN-11',
  demandIndex: 0.42,
  congestionIndex: 0.42,
  mode: 'mode-sample',
  observedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

16 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `emergency.incident.created.v1` (safety-emergency) — An incident closes lanes and pulls resources; both are mobility facts.
- `emergency.resource.requested.v1` (safety-emergency) — Emergency resource requests are dispatch orders for Transport.
- `health.emergency.declared.v1` (health) — A health emergency is a transport mission with a clock.
- `health.capacity.updated.v1` (health) — A resource is only correctly routed if the destination can receive it.
- `resilience.resource-request.created.v1` (resilience) — Relief convoys are planned from crisis resource requests.
- `resilience.crisis.declared.v1` (resilience) — Crisis mode reprioritises the entire fleet.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/mobility-logistics/dependencies   # intégrations en panne
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
