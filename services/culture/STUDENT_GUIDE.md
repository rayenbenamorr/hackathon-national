# STUDENT GUIDE — Tunisia Cultural Intelligence Network

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Tunisia Cultural Intelligence Network**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/culture/health
curl http://localhost:4000/api/culture/assets
curl http://localhost:4000/api/culture/signals
```

Le troisième appel est le plus important : il montre ce que **16 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Make culture an infrastructure with a state — conserved, visited, funded — rather than a calendar of events.

Trois modules à faire vivre :

1. **Tunisia Cultural Digital Twin** — Condition and use of every cultural asset.
2. **Immersive Tunisia** — Digitised works and immersive access.
3. **Creative Economy AI Network** — Creative activity, audience and revenue.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `culture` (Tunisia Cultural Intelligence Network). Lis
> `services/culture/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `culture`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `culture` à `digital-nervous-system` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `culture.asset-condition.updated.v1` — Condition of a cultural asset changed.
- `culture.event.scheduled.v1` — A cultural event was scheduled — mobility, safety and tourism plan against it.
- `culture.creative-economy.updated.v1` — Creative activity and revenue for a governorate.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('culture.asset-condition.updated.v1', {
  assetId: 'asset_0001',
  governorate: 'TN-11',
  conditionIndex: 0.42,
  protectionStatus: 'protectionStatus-sample',
  observedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `iot.sensor.observation.v1` (digital-nervous-system) — Humidity, temperature and vibration observations are the asset condition twin.
- `environment.air-quality.updated.v1` (environment) — Pollution is the slow destroyer of monuments and open-air sites.
- `environment.climate-risk.updated.v1` (environment) — Flood and humidity risk set the conservation queue.
- `tourism.visitor-flow.updated.v1` (tourism) — Visitor load is the main controllable pressure on cultural assets.
- `tourism.site-pressure.detected.v1` (tourism) — Over-capacity means restricting access, which Culture decides.
- `heritage.site-condition.updated.v1` (religious-heritage) — Shared assets must not carry two contradictory condition records.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/culture/dependencies   # intégrations en panne
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
