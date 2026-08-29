/* Platform observability. Same rules as the portal: no framework, no build. */

const $ = (s) => document.querySelector(s);
const api = (p) => fetch(p).then((r) => r.json());
const esc = (s) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);

/** Renders one trace as the tree from §27 of the brief. */
function renderFlow(node, depth = 0) {
  if (!node) return '';
  const pad = '  '.repeat(depth);
  const arrow = depth ? '→ ' : '';
  const via = depth ? ` <span class="via">${esc(node.via)}</span>` : '';
  const line = `${pad}${arrow}<span class="svc ${node.ok ? '' : 'fail'}">${esc(node.service)}</span>${via}`;
  return [line, ...node.children.map((child) => renderFlow(child, depth + 1))].join('\n');
}

async function refresh() {
  const [traces, failures, deadletter, ai, logs] = await Promise.all([
    api('/__platform/traces?limit=12'),
    api('/__platform/failures?limit=25'),
    api('/__platform/events/deadletter'),
    api('/__platform/ai'),
    api('/__platform/logs?limit=200'),
  ]);

  $('#traces').innerHTML =
    traces.filter((t) => t.hops > 1).length === 0
      ? '<p class="muted">No multi-service chain yet. Trigger one:<br><code>curl -X POST localhost:4000/api/food-water/water/shortage/predict -H "content-type: application/json" -d \'{"governorate":"TN-41"}\'</code></p>'
      : traces
          .filter((t) => t.hops > 1)
          .slice(0, 8)
          .map(
            (t) =>
              `<div style="margin-bottom:14px"><div class="muted">${esc(t.traceId)} · ${t.hops} hops</div><pre style="margin:4px 0">${renderFlow(t.flow)}</pre></div>`,
          )
          .join('');

  $('#failures').innerHTML = failures.length
    ? `<table><thead><tr><th>When</th><th>From</th><th>To</th><th>Relation</th><th>Reason</th></tr></thead><tbody>${failures
        .map(
          (f) =>
            `<tr><td class="mono">${esc(f.ts.slice(11, 19))}</td><td>${esc(f.from)}</td><td>${esc(f.to)}</td><td><code>${esc(f.relation)}</code></td><td>${esc(f.reason)}</td></tr>`,
        )
        .join('')}</tbody></table>`
    : '<p class="muted">None. Every declared relation that has been exercised worked.</p>';

  $('#deadletter').innerHTML = deadletter.length
    ? deadletter
        .slice(0, 10)
        .map(
          (d) =>
            `<div class="callout bad"><code>${esc(d.envelope.eventType)}</code> from <b>${esc(d.envelope.sourceService)}</b><br><span class="muted">${esc(d.reason)}</span></div>`,
        )
        .join('')
    : '<p class="muted">Empty. No service has published an event that breaks its own contract.</p>';

  $('#ai').innerHTML =
    `<p class="muted">${esc(ai.note)}</p>` +
    (ai.usage.length
      ? `<table><thead><tr><th>Service</th><th>Calls</th><th>Mode</th></tr></thead><tbody>${ai.usage
          .map(
            (u) =>
              `<tr><td>${esc(u.service)}</td><td>${u.calls}</td><td><span class="pill ${u.mock ? 'ok' : 'critical'}">${u.mock ? 'mock' : 'real'}</span></td></tr>`,
          )
          .join('')}</tbody></table>`
      : '<p class="muted">No AI call yet.</p>');

  const filter = $('#log-filter').value.trim().toLowerCase();
  $('#logs').innerHTML = logs
    .filter((l) => !filter || (l.service ?? '').includes(filter) || l.message.toLowerCase().includes(filter))
    .map(
      (l) =>
        `<div class="lvl-${esc(l.level)}"><span class="muted">${esc(l.ts.slice(11, 23))}</span> ${esc(l.level.padEnd(5))} <b>${esc(l.service ?? 'platform')}</b> ${esc(l.message)}</div>`,
    )
    .join('');
}

$('#log-filter').addEventListener('input', refresh);
await refresh();
setInterval(refresh, 5000);
