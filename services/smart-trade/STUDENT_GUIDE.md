# STUDENT GUIDE — Smart Trade Network

> **Vous n'avez pas besoin de comprendre l'infrastructure.** Décrivez ce que vous
> voulez construire à Claude Code, il s'occupe de l'architecture.
> _You do not need to understand the infrastructure. Describe what you want to
> build to Claude Code; it handles the architecture._

## 1. Démarrer / Start

```bash
pnpm install     # une seule fois / once
pnpm dev         # démarre les 24 services / starts all 24 services
```

Ouvrez / open **http://localhost:4000** → votre ministère : **Smart Trade Network**.

## 2. Vérifier que ça marche / Check it works

```bash
curl http://localhost:4000/api/smart-trade/health
curl http://localhost:4000/api/smart-trade/products
curl http://localhost:4000/api/smart-trade/signals
```

Le troisième appel est le plus important : il montre ce que **15 autres
ministères** ont déjà envoyé à votre service, sans que vous ayez écrit une ligne.

## 3. Votre mission / Your mission

Give every exported product a verifiable identity, and give the country a map of the dependencies that decide whether it can be produced at all.

Trois modules à faire vivre :

1. **Smart Product Passport** — Origin, footprint and certification as a portable record.
2. **AI Export Copilot** — What a producer must do to reach a target market.
3. **National Supply Graph** — Dependencies between products, inputs and corridors.

## 4. Parler à Claude Code / Talk to Claude Code

Copiez une de ces phrases. Elles suffisent.

> Je travaille sur le service `smart-trade` (Smart Trade Network). Lis
> `services/smart-trade/SERVICE_BRIEF.md` et `RELATIONS.md`, puis ajoute
> **[votre idée]**. Respecte les contrats existants et mets à jour toutes les
> intégrations affectées.

> Ajoute un capteur simulé de **[type]** à `smart-trade`, connecte ses
> observations au digital twin et publie les événements vers tous les services
> logiquement concernés.

> Ajoute une capacité IA qui **[objectif]**. Utilise `ctx.ai` et vérifie que ça
> marche en mode mock, sans clé API.

> Connecte `smart-trade` à `digital-nervous-system` pour **[objectif métier]**. Utilise
> l'architecture d'événements existante et ajoute les tests.

Plus d'exemples : `docs/STUDENT_CLAUDE_PROMPTS.md`.

## 5. Ce que vous publiez / What you publish

- `trade.product-passport.issued.v1` — A product passport was issued — origin, footprint, certification.
- `trade.shipment.updated.v1` — A shipment changed state.
- `trade.export-opportunity.detected.v1` — A market opening was detected for a product.
- `trade.supply-risk.flagged.v1` — A dependency in the supply graph is at risk.

Publier un événement, depuis n'importe quelle route :

```ts
await ctx.publish('trade.product-passport.issued.v1', {
  passportId: 'passport_0001',
  productId: 'product_0001',
  category: 'category-sample',
  originGovernorate: 'TN-11',
  carbonKgPerTonne: 42.5,
  issuedAt: '2026-08-28T09:00:00.000Z',
});
```

Tous les services qui écoutent le reçoivent. Vous n'avez rien d'autre à faire.

## 6. Ce que vous recevez / What you receive

16 événements arrivent déjà dans `src/consumers.ts`. Chacun est
enregistré automatiquement ; il ne manque que **votre réaction**.

- `agriculture.yield.forecast.v1` (food-water) — Exportable volume of olive oil, dates and cereals is a yield forecast first.
- `fisheries.stock.updated.v1` (food-water) — Seafood export capacity follows stock and effort.
- `industry.production.updated.v1` (industrial-energy) — The supply graph is built from what plants actually produce.
- `logistics.freight.updated.v1` (mobility-logistics) — A shipment without a freight movement is a plan, not a shipment.
- `transport.congestion.detected.v1` (mobility-logistics) — Corridor congestion is the most common cause of a missed export window.
- `environment.air-quality.updated.v1` (environment) — Carbon and emission context feeds the product passport footprint.

## 7. Quand quelque chose casse / When something breaks

```bash
curl http://localhost:4000/api/smart-trade/dependencies   # intégrations en panne
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
