import { MINISTRY_DOMAINS, type MinistryDomain } from '@platform/runtime';

/**
 * THE WELCOME PAGE — what `sante.tukhnanutha.com` shows before anything else.
 *
 * Rendered on the server, as one string, with its CSS inlined. Three reasons,
 * and they are the whole design:
 *
 *   1. It is the front door. A jury opening it on a phone, on the venue's wifi,
 *      must see the ministry — not a spinner. No fetch, no second request, no
 *      JavaScript: the first packet already contains the page.
 *   2. The theme lives in `packages/runtime/src/domains.ts`, the same file that
 *      decides which Host maps to which ministry. One source, so a colour can
 *      never disagree with a hostname.
 *   3. Twenty-four pages, one template. Adding a ministry is adding a row over
 *      there — nothing here is written twice.
 *
 * The working portal is one click away at /portail. This page does not try to
 * be it: it says where you are, who your neighbours are, and how to make the
 * first call.
 */

export interface WelcomeInput {
  ministry: MinistryDomain;
  /** The service's English name and description, from SERVICE_DIRECTORY. */
  name: string;
  description: string;
  running: boolean;
  baseDomain: string;
  /** Counts shown as the four facts. */
  routes: number;
  publishes: number;
  consumes: number;
  /** The service ids this ministry is wired to, in declaration order. */
  partners: string[];
}

const esc = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

/** #7c8cf5 → "124, 140, 245", so the accent can be used at any opacity. */
const rgb = (hex: string): string => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');

const byService = new Map(MINISTRY_DOMAINS.map((d) => [d.service, d]));

export function welcomePage(input: WelcomeInput): string {
  const { ministry: m, baseDomain: base } = input;
  const host = `${m.slug}.${base}`;
  const neighbours = input.partners
    .map((id) => byService.get(id))
    .filter((d): d is MinistryDomain => Boolean(d));

  const fact = (value: number | string, label: string, hint: string) => `
      <div class="fact" title="${esc(hint)}">
        <strong>${esc(String(value))}</strong>
        <span>${esc(label)}</span>
      </div>`;

  const chip = (d: MinistryDomain) => `
        <a class="chip" href="https://${d.slug}.${base}" style="--c:${d.accent}">
          <i>${d.icon}</i><span>${esc(d.label)}</span>
        </a>`;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(m.label)} — Écosystème numérique national</title>
<meta name="description" content="${esc(m.tagline)}" />
<meta name="theme-color" content="${m.accent}" />
<meta property="og:title" content="${esc(m.label)} — Écosystème numérique national" />
<meta property="og:description" content="${esc(m.tagline)}" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E${encodeURIComponent(m.icon)}%3C/text%3E%3C/svg%3E" />
<style>
:root{
  --accent:${m.accent};
  --accent-rgb:${rgb(m.accent)};
  --bg:#0d1117; --panel:#141b24; --line:#232c39;
  --ink:#e6edf3; --muted:#8b98a8;
  --mono:ui-monospace,'SF Mono','Cascadia Mono',Menlo,Consolas,monospace;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--bg); color:var(--ink);
  font:16px/1.6 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  /* The accent bleeds in from the top: the page is tinted before it is read. */
  background-image:radial-gradient(1100px 520px at 50% -220px,rgba(var(--accent-rgb),.20),transparent 70%);
  background-repeat:no-repeat;
}
a{color:inherit}
.wrap{max-width:940px;margin:0 auto;padding:0 24px}

/* --------------------------------------------------------------- top bar */
.top{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:16px 0;border-bottom:1px solid var(--line);flex-wrap:wrap;
}
.top b{font-weight:600;font-size:14px;letter-spacing:.2px}
.top nav{display:flex;gap:8px;flex-wrap:wrap}
.top nav a{
  text-decoration:none;font-size:13px;color:var(--muted);
  padding:6px 11px;border:1px solid var(--line);border-radius:999px;
}
.top nav a:hover{color:var(--ink);border-color:rgba(var(--accent-rgb),.55)}

/* ------------------------------------------------------------------ hero */
.hero{padding:64px 0 48px;text-align:center}
.mark{
  width:96px;height:96px;margin:0 auto 26px;border-radius:26px;
  display:grid;place-items:center;font-size:46px;line-height:1;
  background:rgba(var(--accent-rgb),.13);
  border:1px solid rgba(var(--accent-rgb),.35);
  box-shadow:0 18px 50px -22px rgba(var(--accent-rgb),.95);
}
.host{
  display:inline-flex;align-items:center;gap:9px;margin:0 0 18px;
  font:13px/1 var(--mono);color:var(--muted);
  padding:7px 13px;border:1px solid var(--line);border-radius:999px;background:rgba(0,0,0,.25);
}
.dot{width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.16)}
.dot.off{background:#f2555a;box-shadow:0 0 0 3px rgba(242,85,90,.16)}
h1{
  margin:0;font-size:clamp(34px,6.2vw,58px);line-height:1.08;
  letter-spacing:-.02em;font-weight:650;
  background:linear-gradient(180deg,var(--ink),rgba(var(--accent-rgb),.92));
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.lead{max-width:640px;margin:20px auto 0;font-size:18px;color:#c3ccd8}
.sub{margin:14px 0 0;font:12px/1.5 var(--mono);color:var(--muted);letter-spacing:.3px}
.actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:34px}
.btn{
  text-decoration:none;font-size:14px;font-weight:550;padding:11px 20px;border-radius:10px;
  border:1px solid var(--line);color:var(--ink);background:var(--panel);
}
.btn:hover{border-color:rgba(var(--accent-rgb),.6)}
.btn.primary{
  background:var(--accent);border-color:var(--accent);color:#0b0f14;
  box-shadow:0 14px 34px -16px rgba(var(--accent-rgb),1);
}
.btn.primary:hover{filter:brightness(1.08)}

/* ----------------------------------------------------------------- facts */
.facts{
  display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
  background:var(--line);border:1px solid var(--line);border-radius:14px;overflow:hidden;margin:8px 0 56px;
}
.fact{background:var(--panel);padding:20px 16px;text-align:center}
.fact strong{display:block;font-size:26px;font-weight:600;color:var(--accent)}
.fact span{display:block;margin-top:4px;font-size:12px;color:var(--muted)}

/* ------------------------------------------------------------- sections */
section h2{font-size:15px;font-weight:600;margin:0 0 6px;letter-spacing:.2px}
section p.note{margin:0 0 18px;font-size:14px;color:var(--muted);max-width:620px}
.block{margin-bottom:56px}

.chips{display:flex;flex-wrap:wrap;gap:9px}
.chip{
  display:inline-flex;align-items:center;gap:8px;text-decoration:none;
  padding:8px 13px 8px 10px;border-radius:999px;font-size:13.5px;
  border:1px solid var(--line);background:var(--panel);
  border-left:3px solid var(--c);
}
.chip i{font-style:normal;font-size:15px;line-height:1}
.chip:hover{border-color:var(--c);background:#19222d}

.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(232px,1fr));gap:14px}
.card{
  border:1px solid var(--line);border-radius:14px;padding:18px;background:var(--panel);
  text-decoration:none;display:block;
}
.card:hover{border-color:rgba(var(--accent-rgb),.55)}
.card b{display:block;font-size:14.5px;font-weight:600;margin-bottom:5px}
.card span{font-size:13px;color:var(--muted)}
pre{
  margin:16px 0 0;padding:16px 18px;overflow-x:auto;
  border:1px solid var(--line);border-radius:12px;background:#0a0e13;
  font:13px/1.75 var(--mono);color:#c9d4e0;
}
pre .c{color:#5d6b7c}
pre .a{color:var(--accent)}

/* ------------------------------------------------------------------ all */
.index{display:flex;flex-wrap:wrap;gap:7px}
.index a{
  text-decoration:none;font-size:12.5px;color:var(--muted);
  padding:5px 10px;border-radius:8px;border:1px solid transparent;
}
.index a:hover{color:var(--ink);border-color:var(--line);background:var(--panel)}
.index a.self{color:var(--accent);border-color:rgba(var(--accent-rgb),.4);background:rgba(var(--accent-rgb),.09)}

footer{border-top:1px solid var(--line);padding:26px 0 46px;color:var(--muted);font-size:12.5px}
footer p{margin:18px 0 0}

@media (max-width:640px){
  .facts{grid-template-columns:repeat(2,1fr)}
  .hero{padding:44px 0 36px}
}
@media (prefers-reduced-motion:no-preference){
  .mark,h1,.lead,.actions{animation:rise .55s cubic-bezier(.2,.7,.3,1) both}
  h1{animation-delay:.05s}.lead{animation-delay:.1s}.actions{animation-delay:.15s}
  @keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
}
</style>
</head>
<body>
<div class="wrap">

  <header class="top">
    <b>🇹🇳 Écosystème numérique national</b>
    <nav>
      <a href="/portail">Portail</a>
      <a href="/__platform/services">Services</a>
      <a href="/admin">Observabilité</a>
    </nav>
  </header>

  <section class="hero">
    <div class="mark">${m.icon}</div>
    <p class="host"><span class="dot${input.running ? '' : ' off'}"></span>${esc(host)}</p>
    <h1>${esc(m.label)}</h1>
    <p class="lead">${esc(m.tagline)}</p>
    <p class="sub">${esc(input.name)} · <code>${esc(m.service)}</code></p>
    <div class="actions">
      <a class="btn primary" href="/portail">Entrer dans le portail</a>
      <a class="btn" href="/me/health">Interroger l’API</a>
    </div>
  </section>

  <div class="facts">${fact(neighbours.length, neighbours.length > 1 ? 'ministères liés' : 'ministère lié', "Les ministères avec lesquels ce service échange, déclarés dans l'architecture.")}${fact(input.routes, input.routes > 1 ? 'routes' : 'route', 'Les points d’entrée HTTP de ce service.')}${fact(input.publishes, 'événements publiés', 'Les contrats dont ce service est le seul propriétaire.')}${fact(input.consumes, 'événements écoutés', 'Ce que ce service reçoit des autres.')}
  </div>

  <section class="block">
    <h2>Vos voisins</h2>
    <p class="note">
      Aucun ministère ne fonctionne seul : voici ceux avec lesquels celui-ci échange.
      Chacun a son adresse et ses couleurs — cliquez pour y aller.
    </p>
    <div class="chips">${neighbours.map(chip).join('')}
    </div>
  </section>

  <section class="block">
    <h2>Par où commencer</h2>
    <p class="note">Trois portes, dans l’ordre où on les pousse d’habitude.</p>
    <div class="cards">
      <a class="card" href="/portail">
        <b>Le portail →</b>
        <span>Vos données, vos voisins, vos événements en direct. Il s’ouvre déjà sur ${esc(m.label)}.</span>
      </a>
      <a class="card" href="/me/health">
        <b>L’API de ce ministère →</b>
        <span><code>/me/…</code> est un raccourci pour <code>/api/${esc(m.service)}/…</code> depuis cette adresse.</span>
      </a>
      <a class="card" href="/__platform/context">
        <b>Ce que sait la plateforme →</b>
        <span>Le nom d’hôte, le ministère qu’il désigne, et les vingt-quatre adresses.</span>
      </a>
    </div>
<pre><span class="c"># le premier appel, depuis n’importe quel terminal</span>
curl https://<span class="a">${esc(host)}</span>/me/health

<span class="c"># le même service, nommé, depuis n’importe quelle adresse</span>
curl https://${esc(host)}/api/<span class="a">${esc(m.service)}</span>/health</pre>
  </section>

  <section class="block">
    <h2>Les vingt-quatre</h2>
    <p class="note">Un ministère, une adresse. Le service répond partout, l’adresse ne fait que choisir le défaut.</p>
    <div class="index">
      ${MINISTRY_DOMAINS.map(
        (d) =>
          `<a href="https://${d.slug}.${base}"${d.service === m.service ? ' class="self"' : ''}>${d.icon} ${esc(d.label)}</a>`,
      ).join('\n      ')}
    </div>
  </section>

  <footer>
    <div class="index">
      <a href="/portail">Portail</a><a href="/admin">Observabilité</a><a href="/__platform/health">Santé de la plateforme</a><a href="/__platform/graph">Graphe</a>
    </div>
    <p>
      Hackathon national — 24 ministères, 24 adresses, une seule plateforme.
      Les données de cette instance sont <strong>synthétiques</strong> : elles ne
      décrivent aucune administration réelle et n’engagent personne.
    </p>
  </footer>

</div>
</body>
</html>
`;
}
