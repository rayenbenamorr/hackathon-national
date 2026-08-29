import {
  allEventContracts,
  ARCHITECTURE_RELATIONS,
  partnersOf,
  SERVICE_DIRECTORY,
} from '@platform/contracts';
import { MINISTRY_DOMAINS, resolveMinistryHost } from '@platform/runtime/domains.ts';
import { welcomePage, type WelcomeFact } from '../../api-gateway/src/welcome.ts';

/**
 * THE TWENTY-FOUR FRONT DOORS, ON CLOUDFLARE — with no machine behind them.
 *
 * A tunnel from someone's desk is not a deployment: it goes dark when the lid
 * closes. This Worker exists so the addresses never do. It answers from
 * Cloudflare's edge, on the free plan, and depends on nothing that can be
 * switched off.
 *
 * It can do that because a welcome page needs no engine. Everything it states
 * is DECLARED — the theme and the host map from `domains.ts`, the relations
 * from `ARCHITECTURE_RELATIONS`, the contracts from the registry — so rendering
 * is string work measured in microseconds, well inside the free plan's 10 ms of
 * CPU. What it deliberately does NOT do is pretend: the portal, the live event
 * feed and `/me/…` need a running platform, so on a path that would need one it
 * says so and points at the repository instead of timing out.
 *
 * The same `welcomePage()` renders here and in the Node gateway. One template,
 * so the public page and the working one can never drift apart; the difference
 * is only in the figures each side can honestly prove.
 */

const CONSUMED = new Map<string, number>();
const API_CALLS = new Map<string, number>();
for (const relation of ARCHITECTURE_RELATIONS) {
  const bucket = relation.kind === 'event' ? CONSUMED : API_CALLS;
  bucket.set(relation.target, (bucket.get(relation.target) ?? 0) + 1);
}

const PUBLISHED = new Map<string, number>();
for (const contract of allEventContracts()) {
  PUBLISHED.set(contract.owner, (PUBLISHED.get(contract.owner) ?? 0) + 1);
}

/** Only figures the declared architecture can justify. No instance is running. */
function facts(service: string): WelcomeFact[] {
  const partners = partnersOf(service).length;
  return [
    {
      value: partners,
      label: partners > 1 ? 'ministères liés' : 'ministère lié',
      hint: "Les ministères avec lesquels ce service échange, déclarés dans l'architecture.",
    },
    {
      value: PUBLISHED.get(service) ?? 0,
      label: 'événements publiés',
      hint: 'Les contrats dont ce service est le seul propriétaire.',
    },
    {
      value: CONSUMED.get(service) ?? 0,
      label: 'événements écoutés',
      hint: 'Les événements des autres ministères auxquels celui-ci est abonné.',
    },
    {
      value: API_CALLS.get(service) ?? 0,
      label: 'appels reçus',
      hint: 'Les dépendances déclarées par d’autres ministères sur l’API de celui-ci.',
    },
  ];
}

const HTML = { 'content-type': 'text/html; charset=utf-8' };

/** The platform root, and anything that is not a ministry hostname. */
function index(base: string): Response {
  const rows = MINISTRY_DOMAINS.map(
    (d) =>
      `<a href="https://${d.slug}.${base}" style="--c:${d.accent}"><i>${d.icon}</i><span>${d.label}</span><code>${d.slug}.${base}</code></a>`,
  ).join('');

  return new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Les vingt-quatre — Écosystème numérique national</title>
<style>
:root{--bg:#0d1117;--panel:#141b24;--line:#232c39;--ink:#e6edf3;--muted:#8b98a8}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
.wrap{max-width:940px;margin:0 auto;padding:64px 24px}
h1{font-size:clamp(30px,5vw,46px);margin:0 0 12px;letter-spacing:-.02em}
p{color:var(--muted);max-width:620px;margin:0 0 36px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
a{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;
  padding:12px 14px;border:1px solid var(--line);border-left:3px solid var(--c);
  border-radius:10px;background:var(--panel)}
a:hover{border-color:var(--c)}
i{font-style:normal;font-size:18px}
span{flex:1;font-size:14px}
code{font:11px ui-monospace,Menlo,Consolas,monospace;color:var(--muted)}
footer{margin-top:48px;padding-top:22px;border-top:1px solid var(--line);color:var(--muted);font-size:12.5px}
</style></head><body><div class="wrap">
<h1>🇹🇳 Écosystème numérique national</h1>
<p>Vingt-quatre ministères, vingt-quatre adresses, une seule plateforme.
Chacune ouvre sur son ministère, dans ses couleurs.</p>
<div class="grid">${rows}</div>
<footer>Exercice pédagogique. Chaque ministère est un service fictif à données
synthétiques : rien ici ne décrit une administration réelle, et rien n’engage
personne.</footer>
</div></body></html>`,
    { headers: HTML },
  );
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const ministry = resolveMinistryHost(url.hostname);

    if (!ministry) return index('tukhnanutha.com');

    const entry = SERVICE_DIRECTORY[ministry.service as keyof typeof SERVICE_DIRECTORY];

    if (url.pathname === '/' || url.pathname === '/accueil') {
      return new Response(
        welcomePage({
          ministry,
          name: entry.name,
          description: entry.description,
          // Nothing is running behind this address, and the page says so rather
          // than showing a green dot it cannot vouch for.
          running: false,
          baseDomain: 'tukhnanutha.com',
          facts: facts(ministry.service),
          partners: partnersOf(ministry.service),
          portal: null,
        }),
        { headers: HTML },
      );
    }

    // Everything else would need a platform. Answering 404 would suggest the
    // address is wrong; it is not — the address is right and the engine is
    // elsewhere. Say which, and how to get one.
    return new Response(
      JSON.stringify(
        {
          error: 'no_running_instance',
          hostname: url.hostname,
          ministry: { service: ministry.service, slug: ministry.slug, label: ministry.label },
          message:
            'Cette adresse sert la page du ministère. Le portail, les API et le flux ' +
            "d'événements demandent une plateforme en marche, et il n'y en a pas derrière " +
            'cette adresse.',
          whatToDo:
            'git clone https://github.com/rayenbenamorr/hackathon-national && pnpm install && pnpm start',
          then: `http://localhost:4000/api/${ministry.service}/health`,
        },
        null,
        2,
      ),
      { status: 503, headers: { 'content-type': 'application/json; charset=utf-8' } },
    );
  },
};
