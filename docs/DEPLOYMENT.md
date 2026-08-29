# Hosting — one subdomain per ministry

```
sante.tukhnanutha.com          → services/health
finances.tukhnanutha.com       → services/treasury
agriculture.tukhnanutha.com    → services/food-water
transport.tukhnanutha.com      → services/mobility-logistics
…24 in total — `pnpm domains`
```

**One origin, 24 hostnames.** The platform reads the `Host` header and decides
which ministry the visitor came for. There is no per-ministry deployment, no
24 servers, no 24 builds. This follows directly from ADR-0004: the boundaries
are logical, so the address can be per-ministry while the process is not.

On a ministry hostname:

| URL                                                  | What it is                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| `https://sante.tukhnanutha.com/`                     | Santé's **welcome page**, in its own colours                   |
| `https://sante.tukhnanutha.com/portail`              | the portal, **opened on Santé**                                |
| `https://sante.tukhnanutha.com/me/capacity`          | `/api/health/capacity`, without typing the id                  |
| `https://sante.tukhnanutha.com/api/food-water/farms` | still works — a subdomain narrows the default, never the reach |
| `https://sante.tukhnanutha.com/__platform/context`   | which ministry this hostname resolved to                       |

Both vocabularies resolve: `sante.` (what people read) and `health.` (what the
code writes). Aliases too — `tresor.`, `eau.`, `energie.`, … See
`pnpm domains --aliases`.

---

## 1. The one thing to know before starting

**This platform cannot run on Cloudflare Workers.** The corporate site
(`www.` / `edu.tukhnanutha.com`) is a Worker; this is not the same kind of
thing. It is a long-lived Node process: an HTTP server on `node:http`, an
in-memory event bus with 358 live subscriptions, and a filesystem it writes to.
Workers have none of those.

So the origin must be somewhere Node runs. In rough order of effort:

| Option                                                   | Effort | Notes                                                                                                                        |
| -------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Tunnel** from a machine you already control | lowest | No public IP, no open port, no new provider. The tunnel becomes the origin for all 24 hostnames. Best fit for a 6-day event. |
| A small VPS (2 vCPU / 2 GB) behind Cloudflare            | low    | `pnpm install && pnpm start` under `systemd`.                                                                                |
| Fly.io / Render / Railway                                | low    | One service, one process. Mount a volume at `DATA_DIR` if you want data to survive a restart.                                |
| A container                                              | medium | Nothing here needs one; see ADR-0001.                                                                                        |

Whatever you pick, Cloudflare stays in front for DNS and TLS.

---

## 2. DNS

Generate the records:

```bash
pnpm domains --zone --target platform.tukhnanutha.com > ministries.zone
```

Then **Cloudflare → DNS → Records → Import and Export → Import**, and pick the
file. 24 `CNAME`s (add `--aliases` for the 37 alternative labels).

Three points that matter:

1. **Keep them proxied (orange cloud).** Cloudflare terminates TLS, and Universal
   SSL already covers `*.tukhnanutha.com` — so all 24 hostnames get a
   certificate with nothing to request. It does **not** cover a second level
   (`a.b.tukhnanutha.com`), which is one of the reasons the platform refuses to
   resolve deeper subdomains to a ministry.
2. **Point `platform.tukhnanutha.com` at the origin** (an `A`/`AAAA` record, or
   the tunnel's `CNAME`). The 24 ministry names are CNAMEs to that one name, so
   moving the origin later is a single record change instead of 24.
3. **Do not use a wildcard `*.tukhnanutha.com`.** It would silently answer for
   every typo and every future subdomain. Explicit records fail visibly, which
   is what you want during an event.

### The one real collision risk

The corporate Worker (`corporate/wrangler.jsonc`) is attached to three explicit
routes:

```
tukhnanutha.com/*      www.tukhnanutha.com/*      edu.tukhnanutha.com/*
```

None of the 24 ministry hostnames matches, so **nothing collides today**. But
if anyone ever widens that to `*.tukhnanutha.com/*`, the Worker will swallow all
24 subdomains and serve the marketing site instead. The reserved-label list in
`packages/runtime/src/domains.ts` protects the reverse direction: `www`, `edu`
and `cdn` can never be routed to a ministry.

---

## 3. Running the origin

```bash
pnpm install
pnpm start          # same process as `pnpm dev`
```

Environment for a hosted instance (`.env`, never committed):

```bash
PLATFORM_PORT=4000
PLATFORM_BASE_DOMAIN=tukhnanutha.com
DATA_DIR=/var/lib/hackathon/.data     # a persistent disk, or accept a reset on restart
LOG_FORMAT=json                        # structured logs for whatever collects them
LOG_LEVEL=info

AI_PROVIDER=mock                       # see §5 — do not put a real key on a public host
AUTH_MODE=dev-tokens                   # see §4 — dev-open on a public host is a defacement risk
AUTH_DEV_SECRET=<a long random string>
```

Health check for the platform, the tunnel or the load balancer:

```
GET /__platform/health   → 200, {"status":"ok","running":24,"declared":24}
```

Then confirm the whole map is live:

```bash
pnpm domains --check
# ✓ sante.tukhnanutha.com   200 → health
# … 24/24 hostnames resolve to the right ministry.
```

---

## 4. Two warnings that are easy to get wrong

**A hosted instance is shared, mutable state.** One origin means one `.data`.
If 1 500 students all POST to it, they overwrite each other's records within
minutes and nobody can tell why. So decide what the hosted instance is FOR:

- **Recommended — a reference and jury instance.** Read-mostly: the portal, the
  relation graph, the event flows, the 24 ministries as the organisers seeded
  them. Students develop **locally**, which is what the whole platform was
  designed for.
- If you instead want each team to have a live address, that is 24 separate
  origins (one per team), each with its own `.data`, each behind its own
  hostname. The routing in this repository already supports it — point the
  ministry's CNAME at that team's origin instead of the shared one. Nothing in
  the code changes.

**`AUTH_MODE=dev-open` is the local default and the wrong choice in public.**
It makes every visitor an authenticated demo citizen, so anyone who finds the
URL can create records. On a public host either set `AUTH_MODE=dev-tokens` and
hand out tokens, or put **Cloudflare Access** in front of the 24 hostnames and
keep it simple. Cloudflare Access is the lighter option and it is already part
of the account.

---

## 5. AI on a hosted instance

Leave `AI_PROVIDER=mock`. A public URL with a real key behind it is a key that
will be spent by someone who is not a student. Every AI feature works in mock
mode — that is the whole point of ADR-0006 — and `/__platform/ai` will say
plainly which mode the instance is in.

If you do enable a real provider, `AI_MAX_CALLS_PER_MINUTE` is the ceiling, and
Cloudflare Access (above) is what keeps the door shut.

---

## 6. Local development needs none of this

`*.localhost` resolves to `127.0.0.1` in Chrome, Edge and Firefox with no
configuration, so the exact production behaviour is available immediately:

```bash
pnpm dev
open http://sante.localhost:4000
open http://finances.localhost:4000
```

Same code path, same `Host` resolution, no DNS, no certificate. If a browser on
the room's network does not resolve `*.localhost`, `http://localhost:4000` shows
the same portal with all 24 ministries listed.

---

## 7. The full map

```bash
pnpm domains              # the table
pnpm domains --aliases    # with the alternative labels
pnpm domains --zone       # BIND records for Cloudflare import
pnpm domains --check      # verify the live deployment
```

The map lives in `packages/runtime/src/domains.ts`. It validates itself at load:
a missing ministry, a duplicate label or a reserved label stops the platform
from starting rather than producing a subdomain that quietly points at the wrong
service.
