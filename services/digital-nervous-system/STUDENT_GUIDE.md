# STUDENT GUIDE — Tunisia Digital Nervous System

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Tunisia Digital Nervous System**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/digital-nervous-system/health
curl http://localhost:4000/api/digital-nervous-system/sensors
curl http://localhost:4000/api/digital-nervous-system/signals
```

Le troisième appel est le plus important : il montre ce que **19 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Be the layer nobody thinks about because it never fails: every sensor observation in the country enters here and reaches whichever ministries care, without any of them knowing the others exist.

Trois modules à faire vivre :

1. **Tunisia Edge AI Mesh** — Edge node health and locally-processed inference.
2. **Sovereign IoT Fabric** — Sensor registry and the single national ingest endpoint.
3. **National Digital Identity + Event Bus** — Service registry, event catalogue, pseudonymous identity.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `digital-nervous-system` (Tunisia Digital Nervous System). Lis
> `services/digital-nervous-system/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `digital-nervous-system`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `digital-nervous-system` à `culture` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `iot.sensor.observation.v1` — One sensor observation. The highest-volume event on the platform; ten ministries consume it.
- `dns.sensor.registered.v1` — A new sensor joined the national fabric.
- `dns.edge-node.status.v1` — Edge node reachability and local inference load.
- `dns.identity.verified.v1` — A pseudonymous identity assertion was verified.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('iot.sensor.observation.v1', {
  observationId: 'observation_0001',
  sensorId: 'sensor_0001',
  sensorKind: 'sensorKind-sample',
  value: 42.5,
  unit: 'unit-sample',
  location: { lat: 36.8065, lon: 10.1815, governorate: 'TN-11' },
  governorate: 'TN-11',
  quality: 'good',
  observedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

15 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `environment.air-quality.updated.v1` (environment) — Station readings validate the fabric against an independent publication.
- `emergency.incident.created.v1` (safety-emergency) — Incidents localise where edge capacity must be reinforced.
- `resilience.crisis.declared.v1` (resilience) — Crisis mode changes edge routing to store-and-forward.
- `resilience.mesh-node.status.v1` (resilience) — Mesh nodes are edge nodes seen by the ministry that deploys them.
- `infrastructure.asset-health.updated.v1` (infrastructure) — Telecom sites are infrastructure assets; their health is fabric health.
- `energy.grid-load.updated.v1` (industrial-energy) — An edge node without power is an edge node that is gone.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/digital-nervous-system/dependencies   # intégrations en panne
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
