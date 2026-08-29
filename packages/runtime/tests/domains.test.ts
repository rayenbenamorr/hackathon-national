import { describe, expect, it, afterEach } from 'vitest';
import { SERVICE_DIRECTORY } from '@platform/contracts';
import {
  allMinistryHosts,
  baseDomain,
  domainFor,
  MINISTRY_DOMAINS,
  ministryUrl,
  RESERVED_LABELS,
  resolveMinistryHost,
} from '@platform/runtime';

const original = process.env.PLATFORM_BASE_DOMAIN;
afterEach(() => {
  if (original === undefined) delete process.env.PLATFORM_BASE_DOMAIN;
  else process.env.PLATFORM_BASE_DOMAIN = original;
});

describe('ministry subdomains', () => {
  it('covers all 24 ministries exactly once', () => {
    expect(MINISTRY_DOMAINS).toHaveLength(24);
    expect(new Set(MINISTRY_DOMAINS.map((d) => d.service)).size).toBe(24);
    for (const id of Object.keys(SERVICE_DIRECTORY)) {
      expect(domainFor(id), `no subdomain for ${id}`).toBeDefined();
    }
  });

  it('uses DNS-legal labels only — no accents, no spaces', () => {
    for (const domain of MINISTRY_DOMAINS) {
      for (const label of [domain.slug, ...domain.aliases]) {
        expect(label, `"${label}" is not a valid DNS label`).toMatch(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/);
      }
    }
  });

  it('resolves the French slug, the alias and the service id to the same ministry', () => {
    for (const host of ['sante.tukhnanutha.com', 'health.tukhnanutha.com']) {
      expect(resolveMinistryHost(host)?.service).toBe('health');
    }
    expect(resolveMinistryHost('finances.tukhnanutha.com')?.service).toBe('treasury');
    expect(resolveMinistryHost('tresor.tukhnanutha.com')?.service).toBe('treasury');
    expect(resolveMinistryHost('agriculture.tukhnanutha.com')?.service).toBe('food-water');
  });

  it('treats the platform root as no ministry', () => {
    expect(resolveMinistryHost('tukhnanutha.com')).toBeNull();
    expect(resolveMinistryHost('www.tukhnanutha.com')).toBeNull();
    expect(resolveMinistryHost('localhost:4000')).toBeNull();
    expect(resolveMinistryHost(undefined)).toBeNull();
  });

  it('never routes a reserved label to a ministry', () => {
    for (const label of RESERVED_LABELS) {
      expect(resolveMinistryHost(`${label}.tukhnanutha.com`), `${label} must stay reserved`).toBeNull();
    }
  });

  it('refuses a second level of subdomain', () => {
    // Cloudflare Universal SSL does not cover it either — see docs/DEPLOYMENT.md.
    expect(resolveMinistryHost('sante.demo.tukhnanutha.com')).toBeNull();
  });

  it('works with no DNS at all, on *.localhost', () => {
    expect(resolveMinistryHost('sante.localhost:4000')?.service).toBe('health');
    expect(resolveMinistryHost('transport.localhost')?.service).toBe('mobility-logistics');
  });

  it('ignores port, case and a trailing dot', () => {
    expect(resolveMinistryHost('SANTE.Tukhnanutha.COM:443')?.service).toBe('health');
    expect(resolveMinistryHost('sante.tukhnanutha.com.')?.service).toBe('health');
  });

  it('follows PLATFORM_BASE_DOMAIN', () => {
    process.env.PLATFORM_BASE_DOMAIN = 'example.test';
    expect(baseDomain()).toBe('example.test');
    expect(ministryUrl('health')).toBe('https://sante.example.test');
    expect(resolveMinistryHost('sante.example.test')?.service).toBe('health');
    expect(allMinistryHosts()).toHaveLength(24);
    expect(allMinistryHosts()).toContain('finances.example.test');
  });

  it('gives every ministry its own colour, mark and sentence', () => {
    for (const domain of MINISTRY_DOMAINS) {
      expect(domain.accent, `${domain.slug} has no accent`).toMatch(/^#[0-9a-f]{6}$/);
      expect(domain.icon.length, `${domain.slug} has no mark`).toBeGreaterThan(0);
      // A tagline is what the welcome page leads with: it must be a sentence.
      expect(domain.tagline.length, `${domain.slug}'s tagline is too short`).toBeGreaterThan(40);
      expect(domain.tagline.endsWith('.'), `${domain.slug}'s tagline is not a sentence`).toBe(true);
    }

    // Distinct, or a hostname stops being recognisable by its colour alone.
    expect(new Set(MINISTRY_DOMAINS.map((d) => d.accent)).size).toBe(24);
    expect(new Set(MINISTRY_DOMAINS.map((d) => d.icon)).size).toBe(24);
    expect(new Set(MINISTRY_DOMAINS.map((d) => d.tagline)).size).toBe(24);
  });

  it('does not collide with the group existing sites', () => {
    // corporate/wrangler.jsonc owns exactly these three hostnames.
    for (const host of ['tukhnanutha.com', 'www.tukhnanutha.com', 'edu.tukhnanutha.com']) {
      expect(resolveMinistryHost(host), `${host} belongs to the corporate site`).toBeNull();
    }
  });
});
