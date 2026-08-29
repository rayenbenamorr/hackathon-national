/* ---------------------------------------------------------------------------
   STUDENT PORTAL
   Plain ES modules. No framework, no bundler, no build step — so it always
   loads, and so a student who opens this file can read every line of it.
   --------------------------------------------------------------------------- */

const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else if (value !== undefined && value !== null) node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
};
const esc = (s) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);
const api = async (path) => {
  const response = await fetch(path, { headers: { accept: 'application/json' } });
  return response.json();
};

const state = {
  services: [],
  graph: null,
  selected: localStorage.getItem('ministry') || null,
  hostMinistry: null,
  baseDomain: null,
};

/* --------------------------------------------------------------- hostname */

/**
 * On sante.tukhnanutha.com the portal must open on Santé, whatever this
 * browser chose last time. The hostname is a stronger signal than a stored
 * preference: someone typed it, or a jury member was given the link.
 */
async function loadContext() {
  try {
    const context = await api('/__platform/context');
    state.baseDomain = context.baseDomain;
    if (!context.ministry) return;

    state.hostMinistry = context.ministry;
    state.selected = context.ministry.service;

    const line = $('#host-line');
    line.textContent = `${context.host} → ${context.ministry.label}`;
    line.hidden = false;
  } catch {
    // The platform root, or an old build: nothing to pin.
  }
}

/* ----------------------------------------------------------------- routing */

for (const button of document.querySelectorAll('nav button')) {
  button.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('active', b === button));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    $(`#view-${button.dataset.view}`).classList.add('active');
    if (button.dataset.view === 'graph') drawGraph();
  });
}

/* ------------------------------------------------------------------ status */

async function refreshStatus() {
  try {
    const health = await api('/__platform/health');
    const dot = $('#status-dot');
    dot.className = `dot ${health.status === 'ok' ? 'ok' : 'degraded'}`;
    $('#status-line').textContent =
      `${health.running}/${health.declared} services · ${health.contracts} contrats d'événements · ` +
      `${health.relations} relations · IA ${health.ai.mock ? 'mock (hors ligne)' : health.ai.model}`;
  } catch {
    $('#status-dot').className = 'dot down';
    $('#status-line').textContent = 'la plateforme ne répond pas — lancez `pnpm dev`';
  }
}

/* -------------------------------------------------------------- ministries */

async function loadServices() {
  state.services = await api('/__platform/services');
  const list = $('#ministry-list');
  list.replaceChildren(
    ...state.services.map((service) =>
      el(
        'button',
        {
          class: `ministry${service.id === state.selected ? ' selected' : ''}`,
          'data-id': service.id,
          onclick: () => selectMinistry(service.id),
        },
        [
          el('i', { class: service.running ? '' : 'off' }),
          el('div', {}, [el('b', {}, service.name), el('span', {}, service.id)]),
        ],
      ),
    ),
  );
  if (state.selected) selectMinistry(state.selected);
}

async function selectMinistry(id) {
  state.selected = id;
  localStorage.setItem('ministry', id);
  document.querySelectorAll('.ministry').forEach((b) => b.classList.toggle('selected', b.dataset.id === id));

  const detail = $('#ministry-detail');
  detail.replaceChildren(el('div', { class: 'panel' }, 'Chargement…'));

  const data = await api(`/__platform/service?id=${encodeURIComponent(id)}`);
  if (data.error) {
    detail.replaceChildren(el('div', { class: 'panel' }, data.message));
    return;
  }
  renderMinistry(detail, data);
}

function renderMinistry(root, data) {
  const health = data.health ?? {};
  const deps = data.dependencies?.items ?? [];
  const broken = deps.filter((d) => !d.reachable);
  const records = Object.entries(health.records ?? {});

  const panel = el('div', { class: 'panel' });

  panel.append(
    el('h1', {}, data.name),
    el('p', { class: 'muted' }, `${data.ministry} · ${data.id} · /api/${data.id}`),
    el('p', {}, data.description),
  );

  if (broken.length) {
    panel.append(
      el('div', { class: 'callout bad' }, [
        el('strong', {}, `${broken.length} intégration(s) indisponible(s) : `),
        broken.map((d) => d.service).join(', '),
        el('div', { class: 'muted' }, broken[0].detail ?? ''),
      ]),
    );
  }

  panel.append(
    el('div', { class: 'stats' }, [
      stat(data.partners.length, 'ministères liés'),
      stat(health.publishes?.length ?? 0, 'événements publiés'),
      stat(health.consumes?.length ?? 0, 'événements reçus'),
      stat(health.twins ?? 0, 'digital twins'),
      stat(records.reduce((total, [, n]) => total + n, 0), 'enregistrements'),
      stat(health.ai?.mock ? 'mock' : health.ai?.provider ?? '—', 'mode IA'),
    ]),
  );

  // --- Modules
  panel.append(el('h3', {}, 'Modules'));
  panel.append(
    el('div', { class: 'cards' }, (health.modules ?? []).map((m) => el('div', { class: 'card' }, [el('b', {}, m)]))),
  );

  // --- Endpoints, with a working "try it" button on every safe GET
  panel.append(el('h3', {}, 'Endpoints'));
  const output = el('pre', { class: 'out' }, 'Cliquez « essayer » sur une route GET.');
  const endpointsTable = el('div', { class: 'muted' }, 'chargement des endpoints…');
  panel.append(endpointsTable, output);

  fetch(`/api/${data.id}/openapi.json`)
    .then((r) => r.json())
    .then((spec) => {
      const rows = [];
      for (const [path, methods] of Object.entries(spec.paths ?? {})) {
        for (const [method, op] of Object.entries(methods)) {
          rows.push([
            el('code', {}, method.toUpperCase()),
            el('code', {}, path),
            op.summary ?? '',
            method === 'get' && !path.includes('{')
              ? el('button', {
                  class: 'try',
                  onclick: async () => {
                    output.textContent = 'chargement…';
                    const res = await fetch(`/api/${data.id}${path}`);
                    output.textContent = JSON.stringify(await res.json(), null, 2);
                  },
                  html: 'essayer',
                })
              : '',
          ]);
        }
      }
      endpointsTable.replaceWith(table(['Méthode', 'Chemin', 'Résumé', ''], rows));
    });

  // --- Relations
  panel.append(el('h3', {}, `Ce que ce ministère écoute (${data.incoming.length})`));
  panel.append(
    table(
      ['De', 'Contrat', 'Criticité', 'Pourquoi'],
      data.incoming.map((r) => [
        el('code', {}, r.source),
        el('code', {}, r.ref),
        el('span', { class: `pill ${r.criticality === 'critical' ? 'critical' : ''}` }, r.criticality),
        r.reason,
      ]),
    ),
  );

  panel.append(el('h3', {}, `Qui dépend de ce ministère (${data.outgoing.length})`));
  panel.append(
    table(
      ['Vers', 'Contrat', 'Criticité', 'Pourquoi'],
      data.outgoing.map((r) => [
        el('code', {}, r.target),
        el('code', {}, r.ref),
        el('span', { class: `pill ${r.criticality === 'critical' ? 'critical' : ''}` }, r.criticality),
        r.reason,
      ]),
    ),
  );

  // --- Signals actually received
  panel.append(el('h3', {}, 'Trafic réel reçu'));
  const signals = el('div', { class: 'muted' }, 'chargement…');
  panel.append(signals);
  fetch(`/api/${data.id}/signals?limit=12`)
    .then((r) => r.json())
    .then((body) => {
      const items = body.items ?? [];
      signals.replaceWith(
        items.length
          ? table(
              ['Reçu', 'Événement', 'De', 'Gouvernorat'],
              items.map((s) => [
                el('span', { class: 'mono' }, s.receivedAt.slice(11, 19)),
                el('code', {}, s.eventType),
                s.from,
                s.governorate ?? '—',
              ]),
            )
          : el(
              'div',
              { class: 'callout' },
              "Aucun signal reçu pour l'instant. C'est normal au démarrage : déclenchez une route d'un ministère voisin, ou lancez `pnpm simulate:sensor air-quality`.",
            ),
      );
    });

  // --- Recent traces
  if (data.recentHops?.length) {
    panel.append(el('h3', {}, 'Derniers échanges'));
    panel.append(
      table(
        ['Type', 'De', 'Vers', 'Quoi', 'OK'],
        data.recentHops.slice(0, 15).map((h) => [
          el('span', { class: 'pill' }, h.kind),
          h.from,
          h.to,
          el('code', {}, h.label),
          el('span', { class: `pill ${h.ok ? 'ok' : 'bad'}` }, h.ok ? 'ok' : 'échec'),
        ]),
      ),
    );
  }

  panel.append(
    el('h3', {}, 'Où continuer'),
    el('div', { class: 'callout' }, [
      el('div', {}, [
        'Ouvrez ',
        el('code', {}, `services/${data.id}/STUDENT_GUIDE.md`),
        ' puis dites à Claude Code ce que vous voulez construire.',
      ]),
    ]),
  );

  root.replaceChildren(panel);
}

function stat(value, label) {
  return el('div', { class: 'stat' }, [el('b', {}, value), el('span', {}, label)]);
}

function table(headers, rows) {
  return el('table', {}, [
    el('thead', {}, el('tr', {}, headers.map((h) => el('th', {}, h)))),
    el(
      'tbody',
      {},
      rows.length
        ? rows.map((cells) => el('tr', {}, cells.map((c) => el('td', {}, c))))
        : [el('tr', {}, el('td', { colspan: headers.length, class: 'muted' }, '—'))],
    ),
  ]);
}

/* ------------------------------------------------------------------ graph */

async function drawGraph() {
  if (!state.graph) state.graph = await api('/__platform/graph');
  const { nodes, edges } = state.graph;
  $('#graph-edge-count').textContent = edges.length;

  const svg = $('#graph');
  svg.replaceChildren();
  const NS = 'http://www.w3.org/2000/svg';
  const cx = 450;
  const cy = 450;
  const r = 330;

  const position = new Map();
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    position.set(node.id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle });
  });

  const edgeLayer = document.createElementNS(NS, 'g');
  const nodeLayer = document.createElementNS(NS, 'g');
  svg.append(edgeLayer, nodeLayer);

  for (const edge of edges) {
    const a = position.get(edge.source);
    const b = position.get(edge.target);
    if (!a || !b) continue;
    const path = document.createElementNS(NS, 'path');
    // Curve through the centre: readable even with 385 edges on screen.
    path.setAttribute('d', `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`);
    path.setAttribute(
      'class',
      `edge ${edge.kind === 'api' ? 'api' : ''} ${edge.criticality === 'critical' ? 'critical' : ''} ${edge.broken ? 'broken' : ''}`,
    );
    path.dataset.source = edge.source;
    path.dataset.target = edge.target;
    edgeLayer.append(path);
  }

  for (const node of nodes) {
    const p = position.get(node.id);
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    circle.setAttribute('r', Math.max(6, Math.min(16, node.partners / 1.6)));
    circle.setAttribute('class', `node ${node.running ? '' : 'off'}`);
    circle.dataset.id = node.id;

    const text = document.createElementNS(NS, 'text');
    const outward = p.x < cx ? -1 : 1;
    text.setAttribute('x', p.x + outward * 22);
    text.setAttribute('y', p.y + 4);
    text.setAttribute('text-anchor', outward < 0 ? 'end' : 'start');
    text.setAttribute('class', 'label');
    text.dataset.id = node.id;
    text.textContent = node.id;

    for (const element of [circle, text]) {
      element.addEventListener('mouseenter', () => focusNode(node.id));
      element.addEventListener('mouseleave', () => focusNode(null));
      element.addEventListener('click', () => {
        document.querySelector('nav button[data-view="ministries"]').click();
        selectMinistry(node.id);
      });
    }
    nodeLayer.append(circle, text);
  }
}

function focusNode(id) {
  const svg = $('#graph');
  const focus = $('#graph-focus');
  for (const path of svg.querySelectorAll('path.edge')) {
    path.classList.remove('dim', 'lit');
    if (!id) continue;
    const touches = path.dataset.source === id || path.dataset.target === id;
    path.classList.add(touches ? 'lit' : 'dim');
  }
  for (const label of svg.querySelectorAll('text.label')) {
    label.classList.toggle('lit', Boolean(id) && label.dataset.id === id);
  }

  if (!id) {
    focus.textContent = '';
    return;
  }
  const node = state.graph.nodes.find((n) => n.id === id);
  const related = state.graph.edges.filter((e) => e.source === id || e.target === id);
  const brokenCount = related.filter((e) => e.broken).length;
  focus.innerHTML =
    `<strong>${esc(node.name)}</strong> — ${node.partners} ministères liés, ${related.length} relations` +
    (brokenCount ? ` · <span style="color:var(--bad)">${brokenCount} cassée(s)</span>` : '') +
    `<br><span class="muted">${esc(related.slice(0, 4).map((e) => e.reason).join(' · '))}</span>`;
}

/* ------------------------------------------------------------------ events */

async function loadEvents() {
  const catalog = await api('/__platform/events');
  $('#event-count').textContent = catalog.length;

  const render = (filter = '') => {
    const shown = catalog.filter(
      (c) => !filter || c.type.includes(filter) || c.owner.includes(filter) || c.summary.toLowerCase().includes(filter),
    );
    $('#event-catalog').replaceChildren(
      ...shown.map((contract) =>
        el('details', {}, [
          el('summary', {}, contract.type),
          el('p', {}, contract.summary),
          el('p', { class: 'muted' }, `Publié par ${contract.owner} · reçu par ${contract.subscribers.length} ministères`),
          el('pre', { class: 'out' }, JSON.stringify(contract.example, null, 2)),
        ]),
      ),
    );
  };

  render();
  $('#event-filter').addEventListener('input', (e) => render(e.target.value.trim().toLowerCase()));

  const feed = $('#live-feed');
  const source = new EventSource('/__platform/stream');
  source.addEventListener('platform', (message) => {
    const data = JSON.parse(message.data);
    feed.prepend(
      el('li', {}, [
        el('div', { class: 't' }, data.eventType),
        el(
          'div',
          { class: 'r' },
          `${data.sourceService} → ${data.subscribers.length ? data.subscribers.join(', ') : 'aucun consommateur'}`,
        ),
      ]),
    );
    while (feed.children.length > 60) feed.lastChild.remove();
  });
}

/* ----------------------------------------------------------------- sensors */

async function loadSensors() {
  const data = await api('/__platform/sensors');
  $('#sensor-kinds').replaceChildren(
    ...data.kinds.map((kind) =>
      el('div', { class: 'card' }, [
        el('b', {}, `${kind.label} (${kind.unit})`),
        el('small', {}, kind.description),
        el('code', {}, `pnpm simulate:sensor ${kind.kind}`),
        el('div', { class: 'muted', style: 'margin-top:8px' }, `→ ${kind.interestedServices.join(', ')}`),
      ]),
    ),
  );
}

/* -------------------------------------------------------------------- boot */

await refreshStatus();
await loadContext();
await loadServices();
await loadEvents();
await loadSensors();
setInterval(refreshStatus, 8000);
