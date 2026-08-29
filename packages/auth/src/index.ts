import { createHmac, timingSafeEqual } from 'node:crypto';
import { createLogger } from '@platform/observability';

/**
 * DEVELOPMENT AUTHENTICATION (§26)
 *
 * Real identity federation is not a hackathon problem. Pretending it is would
 * cost every one of 1 500 beginners an afternoon and teach nothing. So:
 *
 *   AUTH_MODE=dev-open   (default)  every caller is an authenticated demo
 *                                   citizen. Nothing to configure, nothing to
 *                                   debug, and the authorisation ABSTRACTION is
 *                                   still exercised on every route.
 *   AUTH_MODE=dev-tokens            callers must present a signed dev token.
 *                                   Same code path, real signature check —
 *                                   this is what a team demoing "restricted
 *                                   agent access" switches on.
 *
 * The abstraction is the deliverable, not the cryptography: services declare
 * `auth: 'agent'` on a route and never think about it again.
 */
const log = createLogger({ service: 'auth' });

export type IdentityKind = 'anonymous' | 'citizen' | 'agent' | 'service';

export interface Identity {
  id: string;
  kind: IdentityKind;
  displayName: string;
  roles: string[];
  /** Present when kind === 'service'. Used for service-to-service calls. */
  service?: string;
  governorate?: string;
  synthetic: true;
}

export type AuthRequirement = 'public' | 'citizen' | 'agent' | 'service';

const RANK: Record<IdentityKind, number> = { anonymous: 0, citizen: 1, agent: 2, service: 3 };
const REQUIRED_RANK: Record<AuthRequirement, number> = { public: 0, citizen: 1, agent: 2, service: 2 };

export const DEMO_CITIZEN: Identity = {
  id: 'citizen_demo000000',
  kind: 'citizen',
  displayName: 'Demo citizen (synthetic)',
  roles: ['citizen'],
  governorate: 'TN-11',
  synthetic: true,
};

export function authMode(): 'dev-open' | 'dev-tokens' {
  return process.env.AUTH_MODE === 'dev-tokens' ? 'dev-tokens' : 'dev-open';
}

function secret(): string {
  return process.env.AUTH_DEV_SECRET ?? 'hackathon-local-development-secret';
}

// ---------------------------------------------------------------------------
// Dev tokens
// ---------------------------------------------------------------------------

function sign(body: string): string {
  return createHmac('sha256', secret()).update(body).digest('base64url');
}

export function issueDevToken(identity: Omit<Identity, 'synthetic'>): string {
  const body = Buffer.from(JSON.stringify({ ...identity, synthetic: true })).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifyDevToken(token: string): Identity | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Identity;
  } catch {
    return null;
  }
}

/** The token one service presents when calling another (§7 approved channel). */
export function serviceIdentity(serviceId: string): Identity {
  return {
    id: `service_${serviceId}`,
    kind: 'service',
    displayName: `${serviceId} (service)`,
    roles: ['service', `service:${serviceId}`],
    service: serviceId,
    synthetic: true,
  };
}

// ---------------------------------------------------------------------------
// Request-time resolution
// ---------------------------------------------------------------------------

export function identityFromHeaders(headers: Record<string, string | string[] | undefined>): Identity {
  const raw = headers['authorization'];
  const header = Array.isArray(raw) ? raw[0] : raw;

  if (header?.startsWith('Bearer ')) {
    const identity = verifyDevToken(header.slice(7).trim());
    if (identity) return identity;
    if (authMode() === 'dev-tokens') {
      throw new UnauthorizedError(
        'The bearer token is not valid. Mint one with issueDevToken() from @platform/auth.',
      );
    }
    log.warn('Ignoring an invalid bearer token because AUTH_MODE=dev-open.');
  }

  if (authMode() === 'dev-tokens') {
    throw new UnauthorizedError(
      'AUTH_MODE=dev-tokens: this request needs an Authorization: Bearer <dev token> header. ' +
        'Set AUTH_MODE=dev-open in your .env if you did not mean to turn this on.',
    );
  }

  return DEMO_CITIZEN;
}

export function authorize(identity: Identity, requirement: AuthRequirement = 'public'): boolean {
  if (requirement === 'service') return identity.kind === 'service';
  return RANK[identity.kind] >= REQUIRED_RANK[requirement];
}

export function requireAuthorization(identity: Identity, requirement: AuthRequirement = 'public'): void {
  if (!authorize(identity, requirement)) {
    throw new ForbiddenError(
      `This endpoint requires "${requirement}" access; the caller is "${identity.kind}". ` +
        'See packages/auth for how to mint a matching development identity.',
    );
  }
}

export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  readonly statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// ---------------------------------------------------------------------------
// Rate limit hook (§26) — a hook, not a wall.
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, { tokens: number; resetAt: number }>();

  constructor(
    private readonly limit = 240,
    private readonly windowMs = 60_000,
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { tokens: this.limit - 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.limit - 1, resetInMs: this.windowMs };
    }
    if (bucket.tokens <= 0) return { allowed: false, remaining: 0, resetInMs: bucket.resetAt - now };
    bucket.tokens -= 1;
    return { allowed: true, remaining: bucket.tokens, resetInMs: bucket.resetAt - now };
  }
}

// ---------------------------------------------------------------------------
// Audit hook (§26)
// ---------------------------------------------------------------------------

export interface AuditEntry {
  ts: string;
  action: string;
  actor: string;
  actorKind: IdentityKind;
  service: string;
  detail?: Record<string, unknown>;
  traceId?: string;
}

const AUDIT: AuditEntry[] = [];

export function audit(entry: Omit<AuditEntry, 'ts'>): void {
  AUDIT.push({ ts: new Date().toISOString(), ...entry });
  if (AUDIT.length > 500) AUDIT.splice(0, AUDIT.length - 500);
  log.info(`audit ${entry.action}`, { service: entry.service, actor: entry.actor, traceId: entry.traceId });
}

export function auditTrail(limit = 100, service?: string): AuditEntry[] {
  const pool = service ? AUDIT.filter((a) => a.service === service) : AUDIT;
  return pool.slice(-limit).reverse();
}
