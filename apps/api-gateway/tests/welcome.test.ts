import { describe, expect, it, afterEach } from 'vitest';
import { domainFor, MINISTRY_DOMAINS } from '@platform/runtime';
import { partnersOf, SERVICE_DIRECTORY } from '@platform/contracts';
import { welcomePage, type WelcomeInput } from '../src/welcome.ts';

const original = process.env.PLATFORM_BASE_DOMAIN;
afterEach(() => {
  if (original === undefined) delete process.env.PLATFORM_BASE_DOMAIN;
  else process.env.PLATFORM_BASE_DOMAIN = original;
});

/** The page as it is really built by the gateway, for one service id. */
function pageFor(service: string, base = 'tukhnanutha.com', overrides: Partial<WelcomeInput> = {}) {
  const ministry = domainFor(service)!;
  const entry = SERVICE_DIRECTORY[service as keyof typeof SERVICE_DIRECTORY];
  return welcomePage({
    ministry,
    name: entry.name,
    description: entry.description,
    running: true,
    baseDomain: base,
    routes: 7,
    publishes: 3,
    consumes: 5,
    partners: partnersOf(service),
    ...overrides,
  });
}

describe('the ministry welcome page', () => {
  it('wears the theme of the host it answers on', () => {
    const page = pageFor('health');
    const sante = domainFor('health')!;

    expect(page).toContain(`--accent:${sante.accent}`);
    expect(page).toContain(sante.icon);
    expect(page).toContain('sante.tukhnanutha.com');
    expect(page).toContain('Capacité hospitalière, signaux épidémiques');
    // The tagline goes through the same escaping as everything else.
    expect(page).toContain('les murs de l&#39;hôpital');
    expect(page).toContain('Connected Health Intelligence System');

    // …and nothing of its neighbour's.
    expect(page).not.toContain(`--accent:${domainFor('treasury')!.accent}`);
  });

  it('exposes the accent as an rgb triple, so it can be used at any opacity', () => {
    // #4ade80 → 74, 222, 128
    expect(pageFor('health')).toContain('--accent-rgb:74, 222, 128');
  });

  it('escapes the ampersand a ministry name carries', () => {
    const page = pageFor('resilience');
    expect(page).toContain('Résilience &amp; Protection civile');
    expect(page).not.toContain('Résilience & Protection civile');
  });

  it('sends each neighbour to its own subdomain, in its own colour', () => {
    const page = pageFor('health');
    for (const id of partnersOf('health')) {
      const neighbour = domainFor(id)!;
      expect(page, `no link to ${id}`).toContain(`href="https://${neighbour.slug}.tukhnanutha.com"`);
      expect(page).toContain(`--c:${neighbour.accent}`);
    }
  });

  it('lists the twenty-four and marks the one you are on', () => {
    const page = pageFor('culture');
    for (const domain of MINISTRY_DOMAINS) {
      expect(page, `missing ${domain.slug}`).toContain(`https://${domain.slug}.tukhnanutha.com`);
    }
    expect(page).toContain(`https://culture.tukhnanutha.com" class="self"`);
  });

  it('says out loud when the service behind the page is not running', () => {
    expect(pageFor('health', 'tukhnanutha.com', { running: false })).toContain('class="dot off"');
    expect(pageFor('health')).not.toContain('class="dot off"');
  });

  it('follows the base domain it is given, everywhere on the page', () => {
    const page = pageFor('health', 'example.test');
    expect(page).toContain('sante.example.test');
    expect(page).not.toContain('tukhnanutha.com');
  });

  it('renders all 24 without throwing, and each one differently', () => {
    const pages = Object.keys(SERVICE_DIRECTORY).map((id) => pageFor(id));
    expect(pages).toHaveLength(24);
    expect(new Set(pages).size).toBe(24);
    for (const page of pages) expect(page.startsWith('<!doctype html>')).toBe(true);
  });
});
