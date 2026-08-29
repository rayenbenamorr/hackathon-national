/**
 * RULES — RESERVED FOR PROMPT 02.
 *
 * Hackathon rules: teams, eligibility, constraints, timing.
 *
 * This package is deliberately empty. Prompt 01 built the technical platform;
 * the hackathon laws, team rules, permissions, competition rules, scoring,
 * terms, governance, intellectual property, submission and evaluation rules
 * are the subject of a second specification and MUST NOT be invented here.
 *
 * What exists is the extension point: a named package, an alias
 * (@platform/rules), and the two shapes below so that wiring it in later
 * is an implementation, not a refactor.
 */

export interface RulesContext {
  /** Who is asking. */
  actor: { id: string; kind: string; roles: string[] };
  /** What they are asking about. */
  subject: Record<string, unknown>;
  at: string;
}

export interface RulesDecision {
  allowed: boolean;
  reason: string;
  /** Set once Prompt 02 defines the rule set this decision came from. */
  ruleId?: string;
}

/** Placeholder: everything is allowed until Prompt 02 says otherwise. */
export function evaluate(_context: RulesContext): RulesDecision {
  return { allowed: true, reason: 'No rules are defined yet (reserved for Prompt 02).' };
}

export const DEFINED = false;
