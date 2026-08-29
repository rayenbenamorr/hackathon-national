# Les concepts, en français simple / Platform concepts

> Sept idées. Après ça, tout le reste de la plateforme est de la conséquence.
> _Seven ideas. Everything else follows from them._

---

## 1. Un service = un ministère

Un dossier `services/<id>/`. Il possède ses données, expose des endpoints,
publie des événements, en écoute d'autres. Il ne peut **pas** lire la base d'un
autre ministère — ce n'est pas interdit, c'est **impossible** : la seule base
qu'il peut nommer est la sienne.

```ts
ctx.db.collection<Farm>('farms').list({ limit: 10 }); // vos fermes
// il n'existe aucune façon d'écrire « les hôpitaux de la Santé » ici
```

Pour les données d'un autre : son API, ou ses événements.

---

## 2. Un événement = une annonce

Quand quelque chose se produit chez vous, vous l'annoncez. Vous ne savez pas qui
écoute, et c'est le but.

```ts
await ctx.publish('agriculture.water-shortage.predicted.v1', {
  alertId: 'alert_1',
  governorate: 'TN-41',
  horizonDays: 7,
  deficitM3Day: 12000,
  severity: 'alert',
  affectedFarms: 40,
  predictedAt: new Date().toISOString(),
});
```

Sept ministères le reçoivent. Vous n'avez appelé personne.

**Un seul service peut publier un événement donné.** `agriculture.*` appartient à
`food-water` ; si un autre essaie, la plateforme refuse en nommant le
propriétaire.

---

## 3. Un contrat = une promesse

Chaque événement a un schéma. Le bus **refuse** de livrer un événement qui ne le
respecte pas, en nommant le champ fautif et le fichier à ouvrir.

Modifier un contrat :

| Changement                                               | Verdict                                            |
| -------------------------------------------------------- | -------------------------------------------------- |
| ajouter un champ **optionnel**                           | sûr, même version                                  |
| supprimer, renommer, changer le type, rendre obligatoire | **nouvelle version `.v2`**, la `.v1` reste vivante |

---

## 4. Un signal = ce que les autres vous ont dit

Tous vos consommateurs enregistrent déjà ce qui arrive.

```bash
curl localhost:4000/api/health/signals
```

Vous voyez le trafic réel de 14 ministères **avant d'avoir écrit une ligne**. Ce
qui manque, c'est votre **réaction** — et c'est exactement le travail du
hackathon.

---

## 5. Un digital twin = l'état vivant d'une chose réelle

Un barrage, un hôpital, une ferme, un gouvernorat. Il a un état, des
observations, un historique, des relations.

```ts
ctx.twins.upsert({ id: 'twin_dam_7', type: 'water-body', label: 'Barrage Sidi Salem' });
ctx.twins.applyObservation('twin_dam_7', observation); // un capteur le met à jour
```

Les autres ministères voient une **référence** (id, type, position, état
général), jamais votre état interne. C'est la différence entre un jumeau
national et une base de données nationale.

---

## 6. Un capteur = une observation qui traverse le pays

```bash
pnpm simulate:sensor water-level
```

Le simulateur envoie à `POST /api/digital-nervous-system/sensors/observations` —
**exactement** le même endpoint qu'utiliserait un vrai ESP32. Une observation
entre par cette porte et arrive dans les 16 ministères que ce type de capteur
concerne.

---

## 7. Une trace = l'histoire d'une décision

Chaque requête et chaque événement portent un `traceId`. Le portail le dessine :

```
food-water
 → agriculture.water-shortage.predicted.v1 → resilience
                                           → treasury
                                           → national-digital-twin
                                           → health
```

C'est plus utile qu'un journal d'infrastructure, et c'est ce qu'il faut montrer
au jury.

---

## Le vocabulaire, en une table

| Mot              | En une phrase                                | Où                            |
| ---------------- | -------------------------------------------- | ----------------------------- |
| **service**      | un ministère                                 | `services/<id>/`              |
| **module**       | une des trois grandes fonctions du ministère | `src/modules/`                |
| **route**        | une URL que quelqu'un peut appeler           | `src/routes.ts`               |
| **événement**    | une annonce à tout le pays                   | `ctx.publish(...)`            |
| **contrat**      | la forme promise d'un événement              | `packages/contracts/`         |
| **consommateur** | votre réaction à l'annonce d'un autre        | `src/consumers.ts`            |
| **adaptateur**   | votre appel à un autre ministère             | `src/adapters.ts`             |
| **signal**       | ce qu'on vous a envoyé, gardé                | `GET /signals`                |
| **twin**         | l'état vivant d'une chose réelle             | `ctx.twins`                   |
| **trace**        | le fil d'une action à travers les ministères | `/admin`                      |
| **relation**     | un lien déclaré entre deux ministères        | `architecture/relations.yaml` |
