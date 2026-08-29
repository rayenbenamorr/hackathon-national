# Quand ça ne marche pas / Troubleshooting

> **Première commande, toujours : `pnpm doctor`.** Elle répond à 80 % de ce qui
> suit.

---

## La plateforme ne démarre pas

| Message                         | Cause                                                     | Solution                                         |
| ------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `Port 4000 is already in use`   | déjà lancée dans un autre terminal, ou un autre programme | fermez l'autre, ou `PLATFORM_PORT=4100 pnpm dev` |
| `Cannot find module`            | dépendances absentes ou install interrompu                | `pnpm install`                                   |
| `service "x" failed to start`   | erreur dans **ce** service ; les 23 autres tournent       | lisez la ligne au-dessus, elle nomme le fichier  |
| rien ne s'affiche, pas d'erreur | Node trop ancien                                          | `node -v` doit être ≥ 20                         |

Une erreur de syntaxe dans votre service n'arrête **pas** la plateforme : le
service est ignoré, les autres démarrent, et `/__platform/health` liste ce qui
manque.

---

## Un événement n'arrive nulle part

1. **Est-ce que quelqu'un écoute ?**

   ```bash
   curl localhost:4000/__platform/events | grep -A3 "votre.event.v1"
   ```

   `subscribers: []` → personne n'a déclaré la consommer. Ajoutez la relation
   dans `tools/spec/relations.mjs`, puis `pnpm generate`.

2. **A-t-il été refusé par son contrat ?**

   ```bash
   curl localhost:4000/__platform/events/deadletter
   ```

   La réponse nomme le champ fautif. Le plus fréquent : un nombre décimal dans un
   champ `int`, ou un champ obligatoire absent.

3. **Un consommateur a-t-il planté ?**
   http://localhost:4000/admin → _Broken integrations_.

---

## Un appel vers un autre ministère échoue

```bash
curl localhost:4000/api/<votre-service>/dependencies
```

| Réponse                  | Signification                                                          |
| ------------------------ | ---------------------------------------------------------------------- |
| `running: false`         | le service n'est pas démarré → `pnpm dev`                              |
| `reachable: false`       | il tourne mais son `/health` échoue → regardez ses logs                |
| `dependency_unavailable` | c'est **normal** en mode `pnpm dev:service` : les voisins sont absents |

Si votre code appelle `tryCall`, vous recevez `{ ok: false, degraded: true }` et
vous devez décider quoi faire. Si c'est `call`, l'erreur remonte en 424 avec le
nom du ministère manquant.

---

## `pnpm architecture:check` échoue

Chaque règle dit **où** et **quoi faire**. Les plus fréquentes :

| Règle                           | Ce qui s'est passé                                 | Correction                                    |
| ------------------------------- | -------------------------------------------------- | --------------------------------------------- |
| 4 — base d'un autre service     | vous lisez la base d'un voisin                     | passez par `ctx.platform` ou par un événement |
| 5 — exemple de contrat invalide | l'`example` ne respecte plus le schéma             | mettez l'exemple à jour                       |
| 7 — relation non implémentée    | déclarée dans le registre, pas dans `consumers.ts` | `pnpm generate`, ou retirez la relation       |
| 8 — événement sans propriétaire | faute de frappe dans le type                       | corrigez, ou déclarez l'événement             |
| 10 — connectivité insuffisante  | un service a moins de 14 partenaires               | ajoutez des relations **plausibles**          |
| 11 — cycle synchrone            | A appelle B qui appelle A                          | transformez un des deux appels en événement   |

---

## L'IA

| Symptôme                         | Cause                                 | Solution                                                      |
| -------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| réponses génériques, `[MOCK AI]` | mode mock — **c'est le défaut voulu** | rien à corriger ; `AI_PROVIDER=openrouter` + clé pour du réel |
| `AI rate limit reached`          | boucle qui appelle en continu         | corrigez la boucle, ou `AI_MAX_CALLS_PER_MINUTE`              |
| `AI_PROVIDER=... but no API key` | clé absente                           | mettez-la dans `.env`, **jamais dans le code**                |
| erreur réseau du fournisseur     | Wi-Fi                                 | la plateforme retombe automatiquement en mock                 |

Le mode mock respecte **toujours** votre schéma : entiers, bornes, énumérations.
Si votre code casse en mock, c'est le schéma qu'il faut lire.

---

## Les capteurs

| Symptôme                                     | Solution                                             |
| -------------------------------------------- | ---------------------------------------------------- |
| `The platform is not answering on port 4000` | lancez `pnpm dev` dans un autre terminal             |
| `Unknown sensor kind`                        | `pnpm simulate:sensor --list`                        |
| aucune observation ne bouge                  | `IOT_SIMULATION_AUTOSTART=false` dans votre `.env` ? |

---

## Les données

| Besoin                            | Commande                      |
| --------------------------------- | ----------------------------- |
| repartir de zéro                  | `pnpm reset && pnpm dev`      |
| réinitialiser un seul service     | `pnpm reset health`           |
| réécrire les données sans serveur | `pnpm seed`                   |
| regarder les données à la main    | ouvrez `.data/<service>.json` |

Vos données sont dans `.data/`, votre code n'est jamais touché.

---

## Avant de committer

```bash
pnpm verify   # lint + typecheck + tests + architecture + smoke
```

Si `verify` passe, vous n'avez cassé personne.

---

## Rien de tout cela ne marche

Copiez **le message d'erreur complet** et donnez-le à Claude Code avec le nom de
votre service. Il a accès à toute l'architecture ; le message d'erreur contient
un `traceId` et le portail sait ce qui s'est passé avant.
