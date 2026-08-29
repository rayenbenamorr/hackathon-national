# STUDENT GUIDE — Industrial & Energy Intelligence Grid

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Industrial & Energy Intelligence Grid**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/industrial-energy/health
curl http://localhost:4000/api/industrial-energy/assets
curl http://localhost:4000/api/industrial-energy/signals
```

Le troisième appel est le plus important : il montre ce que **19 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Run industry and energy as one system: the grid knows what industry is about to do, and industry knows what the grid can afford.

Trois modules à faire vivre :

1. **Industrial Digital Twin Network** — Twin per industrial asset: output, consumption, condition.
2. **Energy Internet** — Node-level load, generation and renewable share.
3. **AI Industrial Symbiosis** — Matches one plant output stream to another plant input.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `industrial-energy` (Industrial & Energy Intelligence Grid). Lis
> `services/industrial-energy/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `industrial-energy`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `industrial-energy` à `digital-nervous-system` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `energy.grid-load.updated.v1` — Load, generation and renewable share at a grid node.
- `energy.outage-risk.flagged.v1` — A node is at risk of failing to serve its load.
- `industry.production.updated.v1` — Production changed at an industrial asset.
- `industry.symbiosis.matched.v1` — One plant waste stream was matched to another plant input.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('energy.grid-load.updated.v1', {
  nodeId: 'node_0001',
  governorate: 'TN-11',
  loadMw: 42.5,
  generationMw: 42.5,
  renewableShare: 0.42,
  observedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `environment.air-quality.updated.v1` (environment) — Emissions constrain production; the plant twin must see its own consequence.
- `environment.waste-stream.updated.v1` (environment) — Waste streams are the raw material of the symbiosis engine.
- `environment.climate-risk.updated.v1` (environment) — Heat risk changes both demand and generation capacity.
- `iot.sensor.observation.v1` (digital-nervous-system) — Energy load and vibration observations are the grid and asset twins.
- `agriculture.water-demand.predicted.v1` (food-water) — Industry and agriculture compete for the same water and the same pumping energy.
- `infrastructure.failure.predicted.v1` (infrastructure) — A predicted power-line failure is an outage risk before it is a maintenance order.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/industrial-energy/dependencies   # intégrations en panne
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
