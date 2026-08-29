# COMMENCEZ ICI / START HERE

> **10 minutes.** À la fin, votre ministère tourne et vous savez quoi demander à
> Claude Code.
> _10 minutes. At the end, your ministry is running and you know what to ask
> Claude Code._

---

## Étape 1 — Démarrer la plateforme / Start the platform

```bash
pnpm install
pnpm dev
```

C'est tout. Il n'y a **rien d'autre à installer** : pas de Docker, pas de base de
données, pas de clé d'API.
_That is all. Nothing else to install: no Docker, no database, no API key._

Ouvrez **http://localhost:4000**.

Si quelque chose ne va pas :

```bash
pnpm doctor
```

---

## Étape 2 — Trouver votre ministère / Find your ministry

Dans le portail, colonne de gauche : cliquez sur votre ministère. Le portail le
retient.

Vous voyez alors, sans avoir écrit une ligne :

| Ce que vous voyez              | Ce que ça veut dire                                             |
| ------------------------------ | --------------------------------------------------------------- |
| **Ministères liés**            | combien d'autres services sont connectés au vôtre (au moins 14) |
| **Endpoints**                  | vos API, avec un bouton « essayer »                             |
| **Ce que ce ministère écoute** | les événements que les autres vous envoient                     |
| **Qui dépend de ce ministère** | ce que les autres attendent de vous                             |
| **Trafic réel reçu**           | ce qui est **déjà** arrivé chez vous                            |
| **Digital twins**              | l'état vivant de ce que vous gérez                              |

L'onglet **Graphe** montre les 24 ministères et leurs 382 relations. Survolez le
vôtre.

---

## Étape 3 — Ouvrir votre dossier / Open your folder

```
services/<votre-ministère>/
```

Lisez **`STUDENT_GUIDE.md`** (5 minutes). Il contient votre mission, vos trois
modules, et les phrases exactes à dire à Claude Code.

Puis, si vous voulez comprendre les connexions : **`RELATIONS.md`**.

---

## Étape 4 — Dire à Claude Code ce que vous voulez / Tell Claude Code

Vous n'avez **pas** besoin de savoir ce qu'est une API, un événement, un bus ou
un microservice. Décrivez l'idée. Exemple réel :

> Je travaille sur le service `food-water` (Autonomous Food & Water Grid).
> Ajoute une fonctionnalité qui prédit la demande en eau à partir de la météo et
> de l'humidité du sol des capteurs. Respecte toutes les relations existantes.

_or in English:_

> I am working on the Agriculture system. I want the irrigation module to
> predict water demand using weather and soil humidity. Respect all existing
> service relationships.

Claude Code va :

1. lire le manifeste de votre service ;
2. lire le graphe des relations ;
3. trouver les **7 autres ministères** concernés ;
4. écrire la fonctionnalité ;
5. mettre à jour les contrats, les producteurs, les consommateurs, les tests et
   la documentation ;
6. vérifier l'architecture.

Vous n'avez rien à demander de tout cela. C'est le travail de la plateforme.

Plus de phrases toutes faites : **[`STUDENT_CLAUDE_PROMPTS.md`](STUDENT_CLAUDE_PROMPTS.md)**.

---

## Étape 5 — Voir que ça marche / See that it works

```bash
# vos données
curl http://localhost:4000/api/<votre-service>/health

# ce que les autres ministères vous ont envoyé
curl http://localhost:4000/api/<votre-service>/signals

# vos intégrations : vert = ça marche, rouge = c'est cassé
curl http://localhost:4000/api/<votre-service>/dependencies
```

Un capteur, en direct :

```bash
pnpm simulate:sensor water-level
```

Regardez ensuite l'onglet **Événements** du portail : l'observation traverse le
pays et arrive dans **16 ministères**.

---

## Les 5 règles / The 5 rules

1. **Ne lisez jamais la base d'un autre service.** Passez par son API ou ses
   événements. (C'est structurellement impossible ici, mais sachez pourquoi.)
2. **Ne cassez pas un contrat.** Ajouter un champ optionnel : sûr. Tout le
   reste : nouvelle version `.v2`.
3. **Données synthétiques uniquement.** Aucune donnée réelle de citoyen.
4. **Aucune clé d'API dans le code.** Elles vont dans `.env`.
5. **Avant de committer :** `pnpm verify`.

---

## Quand ça casse / When it breaks

| Symptôme                         | Commande                                    |
| -------------------------------- | ------------------------------------------- |
| rien ne démarre                  | `pnpm doctor`                               |
| une intégration ne répond pas    | `curl localhost:4000/api/<id>/dependencies` |
| un événement n'arrive nulle part | portail → onglet **Événements**             |
| « pourquoi ça a échoué ? »       | http://localhost:4000/admin                 |
| je veux repartir de zéro         | `pnpm reset && pnpm dev`                    |

Détails : **[`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)**.

---

## Ce que vous n'avez PAS à apprendre

Docker · Kubernetes · les brokers de messages · les migrations de base de
données · le service discovery · le tracing distribué · les passerelles d'API ·
OpenTelemetry · l'infrastructure.

Tout cela existe dans cette plateforme, et tout cela est déjà fait.

**Vous vous occupez du problème, de l'idée, des données, de l'IA, de l'IoT, du
prototype. La plateforme s'occupe du reste.**
