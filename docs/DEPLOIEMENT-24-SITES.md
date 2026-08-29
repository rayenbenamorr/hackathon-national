# Deployer les 24 sites — la marche a suivre

> Procedure operationnelle, dans l'ordre. Chaque etape a une commande exacte et
> une facon de verifier qu'elle a marche. Tout ce qui touche au DNS est en
> simulation par defaut : rien ne part sans `--confirm`.

**EN LIGNE depuis le 29/08/2026.** Les 24 noms existent, le tunnel `hackathon`
(`cd5c3cd1-0d62-422d-8235-5b32fc254cd5`) est `healthy` sur quatre connexions,
`platform.tukhnanutha.com` pointe dessus, et `pnpm domains --check` donne
**24/24**. Le Worker du site corporate n'ecoute que `tukhnanutha.com/*`, `www.`
et `edu.` : aucune collision, verifie apres coup.

> **L'origine est le PC de bureau.** Les 24 sites repondent tant que ce poste est
> allume et que `cloudflared` tourne ; en veille, tout retombe en erreur 1016.
> Deplacer l'origine = changer le seul enregistrement `platform.`.

> **Deux jetons, pas un.** Celui de la zone (`CLOUDFLARE_DNS_API_TOKEN`) ecrit
> les enregistrements ; celui du compte (`CLOUDFLARE_TUNNEL_API_TOKEN`) cree et
> configure les tunnels. Aucun des deux ne fait le travail de l'autre. Les deux
> sont dans `~/.secrets/tukhnanutha-cloudflare.env`.

---

## Le principe, en une phrase

**Une seule origine, 24 noms.** La passerelle lit l'en-tete `Host` et sert le
bon ministere. Il n'y a pas 24 serveurs, pas 24 builds, pas 24 deploiements.

```
sante.tukhnanutha.com  ─┐
finances.tukhnanutha.com├─→ platform.tukhnanutha.com ─→ une machine ─→ pnpm start
… 24 …                 ─┘        (CNAME)                             (port 4000)
```

Changer d'origine plus tard = **un seul enregistrement a modifier**, pas 24.

---

## Etape 0 — Ce qu'il faut avoir

|                                       |                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| Une machine qui fait tourner Node 20+ | un petit VPS, ou une machine du bureau allumee                                |
| Le depot `hackathon-national` dessus  | `git clone` puis `pnpm install`                                               |
| `cloudflared`                         | deja installe chez vous                                                       |
| Le jeton Cloudflare                   | `~/.secrets/tukhnanutha-cloudflare.env` — il doit avoir **Zone → DNS → Edit** |

> Le jeton actuel **lit** la zone (verifie). S'il n'a que la permission Workers,
> l'etape 3 s'arretera sur un HTTP 403 : il faudra alors en creer un avec
> `Zone → DNS → Edit` dans le tableau de bord Cloudflare.

---

## Etape 1 — Faire tourner la plateforme sur l'origine

Sur la machine choisie :

```bash
cd hackathon-national
cp .env.example .env
```

Editez `.env` — les quatre lignes qui comptent en public :

```bash
PLATFORM_BASE_DOMAIN=tukhnanutha.com
DATA_DIR=/var/lib/hackathon/.data     # un disque qui survit au redemarrage
AI_PROVIDER=mock                       # surtout pas de vraie cle sur une URL publique
AUTH_MODE=dev-tokens                   # dev-open = n'importe qui peut ecrire
AUTH_DEV_SECRET=<une longue chaine aleatoire>
LOG_FORMAT=json
```

Puis :

```bash
pnpm install
pnpm start
```

**Verifier :**

```bash
curl http://127.0.0.1:4000/__platform/health
# attendu : {"status":"ok","running":24,"declared":24, …}
```

Pour que ca survive a une deconnexion, mettez-le en service (`systemd`,
`pm2`, ou simplement `tmux`).

---

## Etape 2 — Exposer l'origine avec un tunnel

C'est la voie la moins couteuse : pas d'IP publique, pas de port ouvert, pas de
certificat a gerer.

**Le tunnel est deja cree** (`hackathon`, du 29/08/2026). Pour le relancer apres
un redemarrage, une seule commande — le jeton du connecteur porte a lui seul
l'identite du tunnel, il n'y a ni `cloudflared tunnel login`, ni `cert.pem`, ni
`config.yml` sur ce poste :

```bash
cloudflared tunnel --no-autoupdate run --token "$(cat ~/.secrets/hackathon-tunnel.token)"
```

La configuration vit **cote Cloudflare** (`config_src: cloudflare`), pas dans un
fichier local : une seule regle d'ingress, `http://localhost:4000`. C'est
volontaire — le poste qui heberge n'a alors rien a garder que le jeton, et
changer la regle ne demande pas d'aller sur la machine.

<details>
<summary>Comment il a ete cree, si on doit le refaire ailleurs</summary>

Tout par API, avec `CLOUDFLARE_TUNNEL_API_TOKEN` (`Account · Cloudflare Tunnel ·
Edit`). Le `cloudflared tunnel login` interactif n'est pas necessaire.

```bash
# 1. le tunnel — la reponse contient l'id ET le jeton du connecteur
curl -X POST -H "Authorization: Bearer $CLOUDFLARE_TUNNEL_API_TOKEN" \
     -H 'content-type: application/json' \
     --data '{"name":"hackathon","config_src":"cloudflare"}' \
     "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/cfd_tunnel"

# 2. l'ingress — une seule regle, la plateforme lit l'en-tete Host
curl -X PUT -H "Authorization: Bearer $CLOUDFLARE_TUNNEL_API_TOKEN" \
     -H 'content-type: application/json' \
     --data '{"config":{"ingress":[{"service":"http://localhost:4000"}]}}' \
     ".../cfd_tunnel/<id>/configurations"

# 3. l'origine — avec l'AUTRE jeton, celui qui ecrit la zone
curl -X POST -H "Authorization: Bearer $CLOUDFLARE_DNS_API_TOKEN" \
     -H 'content-type: application/json' \
     --data '{"type":"CNAME","name":"platform","content":"<id>.cfargotunnel.com","proxied":true,"ttl":1}' \
     "https://api.cloudflare.com/client/v4/zones/<zone>/dns_records"
```

</details>

**Verifier :**

```bash
curl https://platform.tukhnanutha.com/__platform/health
```

> **Variante sans tunnel :** un VPS avec une IP publique. Creez alors
> `platform.tukhnanutha.com` en enregistrement `A` vers cette IP, proxifie
> (nuage orange). Le reste de la procedure ne change pas.

---

## Etape 3 — Creer les 24 enregistrements DNS

Depuis votre machine (celle qui a le jeton) :

```bash
cd hackathon-national

# 1. SIMULATION — rien n'est ecrit
pnpm dns:plan --env-file ~/.secrets/tukhnanutha-cloudflare.env
```

Lisez le plan. Vous devez voir **24 lignes `+`** et **0 conflit**. Une ligne `!`
signifie qu'un nom existe deja pour autre chose : l'outil n'y touche jamais,
c'est a arbitrer a la main.

```bash
# 2. APPLICATION — cette fois ca ecrit
pnpm dns:apply \
  --env-file ~/.secrets/tukhnanutha-cloudflare.env \
  --target platform.tukhnanutha.com \
  --confirm
```

Trois choix faits pour vous, et pourquoi :

- **Proxifie (nuage orange).** Cloudflare termine le TLS, et Universal SSL
  couvre deja `*.tukhnanutha.com` : les 24 certificats arrivent tout seuls.
- **CNAME vers `platform.`, pas vers l'origine.** Deplacer l'origine plus tard
  = un enregistrement a changer.
- **Pas de joker `*.tukhnanutha.com`.** Il repondrait a chaque faute de frappe
  et a chaque futur sous-domaine. Des enregistrements explicites echouent
  visiblement, ce qu'on veut pendant un evenement.

---

## Etape 4 — Verifier les 24

```bash
pnpm domains --check
```

Attendu :

```
  ✓ sante.tukhnanutha.com          200 → health
  ✓ finances.tukhnanutha.com       200 → treasury
  …
  24/24 hostnames resolve to the right ministry.
```

Un `✗` dit lequel et pourquoi. Les deux causes habituelles : la propagation
(attendre une minute) ou le tunnel arrete.

---

## Etape 5 — Fermer la porte

Une instance publique en `AUTH_MODE=dev-open` laisse ecrire n'importe qui.
Deux options, la premiere est la plus simple :

1. **Cloudflare Access** devant les 24 noms — vous l'avez deja dans le compte.
   Zero Trust → Access → Applications → domaine `*.tukhnanutha.com`, avec la
   liste des adresses autorisees.
2. `AUTH_MODE=dev-tokens` et distribuer des jetons (voir `packages/auth`).

Et laissez `AI_PROVIDER=mock`. Une URL publique avec une vraie cle derriere est
une cle qui sera depensee par quelqu'un d'autre. Le mode mock fait fonctionner
**toutes** les fonctions IA, hors ligne, gratuitement.

---

## Etape 6 — Consigner dans l'espace employe

Dans `/interne/hackathon/deploiement`, la table des 24 sous-domaines. Apres le
`pnpm domains --check`, marquez chaque ligne **En ligne** ou **Hors ligne** :
l'ecran garde la date du dernier controle, et le tableau de bord affiche le
compte.

C'est volontairement manuel. Vingt-quatre appels vers vingt-quatre hotes depuis
un navigateur, c'est du CORS et de l'attente, pour une reponse que la commande
donne en trois secondes et de facon plus fiable.

---

## Si une equipe doit avoir sa propre adresse

Le routage le permet deja, sans toucher au code : faites pointer le CNAME de
**ce** ministere vers l'origine de l'equipe plutot que vers l'origine partagee.

```bash
# exemple : l'equipe Sante heberge chez elle
pnpm dns:apply --env-file … --target origine-equipe-sante.exemple.com --confirm
# puis remettre les 23 autres sur l'origine partagee si besoin
```

Chaque origine a alors son propre `.data`, ce qui est le point : une instance
partagee ou 1 500 etudiants ecrivent devient illisible en quelques minutes.

---

## Revenir en arriere

| Pour                           | Faire                                                               |
| ------------------------------ | ------------------------------------------------------------------- |
| Retirer un ministere du public | supprimer son enregistrement dans le tableau de bord Cloudflare     |
| Tout arreter                   | arreter `cloudflared` : les 24 noms tombent d'un coup, le DNS reste |
| Repartir de zero cote donnees  | `pnpm reset && pnpm start` sur l'origine                            |
| Deplacer l'origine             | changer le seul enregistrement `platform.tukhnanutha.com`           |

---

## Recapitulatif — les six commandes

```bash
pnpm install && pnpm start                                    # 1. la plateforme
cloudflared tunnel run hackathon                              # 2. l'exposition
pnpm dns:plan  --env-file ~/.secrets/…-cloudflare.env         # 3. la simulation
pnpm dns:apply --env-file ~/.secrets/…-cloudflare.env \
               --target platform.tukhnanutha.com --confirm    # 4. les 24 CNAME
pnpm domains --check                                          # 5. la verification
# 6. consigner dans /interne/hackathon/deploiement
```
