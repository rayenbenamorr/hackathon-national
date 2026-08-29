# STUDENT GUIDE — National Safety & Emergency Grid

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **National Safety & Emergency Grid**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/safety-emergency/health
curl http://localhost:4000/api/safety-emergency/incidents
curl http://localhost:4000/api/safety-emergency/signals
```

Le troisième appel est le plus important : il montre ce que **19 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Receive an incident from anywhere, understand it in seconds, and pull the nearest capable resource from whichever ministry owns it.

Trois modules à faire vivre :

1. **National Emergency Brain** — Triage, severity and the dispatch decision.
2. **AI Road Safety Grid** — Continuous risk scoring of road segments.
3. **Smart Civil Services** — Civil requests that do not need an emergency response.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `safety-emergency` (National Safety & Emergency Grid). Lis
> `services/safety-emergency/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `safety-emergency`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `safety-emergency` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `emergency.incident.created.v1` — An incident was reported. The most widely consumed event on the platform.
- `emergency.incident.resolved.v1` — An incident is closed, with how long it took.
- `emergency.resource.requested.v1` — Emergency asks another ministry for a specific resource.
- `emergency.road-risk.updated.v1` — Risk score for a road segment changed.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('emergency.incident.created.v1', {
  incidentId: 'incident_0001',
  incidentType: 'incidentType-sample',
  severity: 'severity-sample',
  location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
  governorate: 'TN-11',
  casualties: 12,
  declaredAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

14 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `health.capacity.updated.v1` (health) — Dispatch sends casualties to the nearest facility that can actually receive them.
- `health.emergency.declared.v1` (health) — A health emergency needs civil protection resources Health does not own.
- `transport.congestion.detected.v1` (mobility-logistics) — Congestion changes response time more than distance does.
- `environment.air-quality.updated.v1` (environment) — Air quality drives both road risk and the protection level responders need.
- `iot.sensor.observation.v1` (digital-nervous-system) — Traffic, rainfall and vibration observations feed continuous road-risk scoring.
- `infrastructure.failure.predicted.v1` (infrastructure) — A failing bridge is a road-risk input and a route exclusion at the same time.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/safety-emergency/dependencies   # intégrations en panne
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
