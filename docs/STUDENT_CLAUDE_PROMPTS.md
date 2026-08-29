# Phrases à dire à Claude Code / Claude Code prompt templates

> Copiez, remplacez ce qui est `[entre crochets]`, envoyez. Vous n'avez pas à
> décrire l'architecture : Claude Code la lit lui-même.
> _Copy, replace what is `[in brackets]`, send. You do not describe the
> architecture; Claude Code reads it._

Remplacez `[SERVICE]` par l'identifiant de votre ministère (`food-water`,
`health`, `mobility-logistics`, …). La liste complète :
[`SERVICE_INDEX.md`](SERVICE_INDEX.md).

---

## 1. Construire une fonctionnalité / Build a feature

**FR**

> Je travaille sur `[SERVICE]`. Implémente **[FONCTIONNALITÉ]**. Commence par
> lire `services/[SERVICE]/service.manifest.yaml` et le graphe global des
> relations. Préserve tous les contrats existants et mets à jour automatiquement
> les intégrations affectées.

**EN**

> I work on `[SERVICE]`. Implement **[FEATURE]**. First inspect the service
> manifest and the global relation graph. Preserve all contracts and
> automatically update every affected integration.

---

## 2. Ajouter un capteur IoT / Add IoT

**FR**

> Ajoute un capteur simulé de **[TYPE : niveau d'eau, qualité de l'air,
> trafic, vibration…]** à `[SERVICE]`. Connecte ses observations au digital twin
> concerné et publie les événements vers tous les services logiquement affectés.

**EN**

> Add a simulated **[SENSOR]** to `[SERVICE]`. Connect its observations to the
> relevant digital twin and publish events to all logically affected services.

> Les 16 types disponibles : `pnpm simulate:sensor --list`

---

## 3. Ajouter de l'IA / Add AI

**FR**

> Ajoute une capacité IA qui **[OBJECTIF]**. Utilise `ctx.ai` du paquet partagé
> et vérifie que ça fonctionne en mode mock, sans clé d'API.

**EN**

> Add an AI capability that **[GOAL]**. Use the shared AI package and make sure
> it works in mock mode, with no API key.

Variantes utiles :

- « … avec du **RAG** sur [ces documents], et cite les sources. »
- « … avec un **agent** qui peut appeler [ces outils]. »
- « … qui **classe** [ces entrées] en [ces catégories]. »
- « … qui **détecte les anomalies** dans [ces observations]. »
- « … qui **prévoit** [cette valeur] à [N] jours. »

---

## 4. Connecter un autre ministère / Connect another ministry

**FR**

> Connecte `[SERVICE A]` à `[SERVICE B]` pour **[OBJECTIF MÉTIER]**. Utilise
> l'architecture de contrats et d'événements existante. Ajoute les tests.

**EN**

> Connect `[SERVICE A]` with `[SERVICE B]` for **[BUSINESS PURPOSE]**. Use the
> existing contract and event architecture. Add tests.

---

## 5. Faire réagir votre service / Make your service react

Vos consommateurs d'événements **enregistrent déjà** ce qui arrive, mais ne
décident rien. C'est là que se gagne le hackathon.

**FR**

> Dans `[SERVICE]`, quand l'événement `[EVENT]` arrive, fais réellement quelque
> chose : **[mets à jour le twin / lève une alerte / recalcule un score /
> publie un événement]**. Montre-moi la chaîne dans le portail après.

---

## 6. Digital twin

**FR**

> Ajoute un digital twin de **[OBJET : un barrage, un hôpital, un couloir
> routier…]** dans `[SERVICE]`, alimenté par les observations de capteurs, avec
> son historique et ses relations vers les twins des autres ministères.

---

## 7. Carte et géographie / Map and geography

**FR**

> Ajoute un endpoint qui renvoie **[CES DONNÉES]** en GeoJSON prêt pour une
> carte, filtrable par gouvernorat. Utilise `@platform/geo`.

---

## 8. Comprendre avant de coder / Understand first

**FR**

> Explique-moi, simplement, ce que fait `[SERVICE]`, à quoi il est connecté, et
> ce qui manque pour qu'il soit vraiment utile.

> Montre-moi tout ce qui arrive dans `[SERVICE]` depuis les autres ministères, et
> ce qu'on devrait en faire.

---

## 9. Réparer / Fix

**FR**

> `[COLLEZ LE MESSAGE D'ERREUR COMPLET]` — que s'est-il passé et comment le
> corriger ?

> `pnpm architecture:check` échoue avec **[CE MESSAGE]**. Corrige la cause, pas
> le symptôme.

---

## 10. Préparer la démonstration / Prepare the demo

**FR**

> Prépare une démonstration de 3 minutes de `[SERVICE]` : un scénario réaliste,
> les commandes exactes à taper dans l'ordre, et ce qu'on doit voir apparaître
> dans le portail à chaque étape.

---

## Ce qu'il ne sert à rien de demander

Ces choses sont **déjà faites** — demandez la fonctionnalité, pas la plomberie :

- « crée-moi une API REST » → vos endpoints existent
- « connecte-moi à la base de données » → `ctx.db` est déjà là et déjà isolée
- « configure le bus d'événements » → `ctx.publish(...)` suffit
- « ajoute l'authentification » → `auth: 'agent'` sur une route suffit
- « ajoute des logs et du tracing » → chaque requête et chaque événement sont
  déjà tracés, visibles dans le portail
- « écris les données de test » → 24 bases sont déjà remplies de données
  synthétiques

---

## Une phrase à retenir

> **Décrivez le problème et le résultat attendu. Pas la solution technique.**

Mauvais : « ajoute une table SQL avec une colonne water_demand et un endpoint POST ».

Bon : « je veux savoir 7 jours à l'avance quels gouvernorats vont manquer d'eau,
et que la Santé et le Trésor le sachent en même temps que moi ».
