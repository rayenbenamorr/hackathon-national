/**
 * Nothing sensitive ever reaches a log line or the student portal.
 *
 * This is a hackathon platform running on synthetic data, but the habit is the
 * point: a student who ships `console.log(patient)` learns nothing, a student
 * whose framework quietly refuses to print `nationalId` learns the rule.
 */
const SENSITIVE_KEYS = [
  'password',
  'secret',
  'token',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'nationalid',
  'national_id',
  'cin',
  'ssn',
  'iban',
  'cardnumber',
  'card_number',
  'phone',
  'email',
  'address',
  'dateofbirth',
  'date_of_birth',
  'medicalrecord',
  'medical_record',
  'diagnosis',
];

const MAX_DEPTH = 6;
const MAX_ARRAY = 50;

export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth >= MAX_DEPTH) return '[depth-limit]';

  if (Array.isArray(value)) {
    const head = value.slice(0, MAX_ARRAY).map((v) => redact(v, depth + 1));
    return value.length > MAX_ARRAY ? [...head, `[+${value.length - MAX_ARRAY} more]`] : head;
  }

  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return { name: value.name, message: value.message };

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.includes(k.toLowerCase()) ? '[redacted]' : redact(v, depth + 1);
    }
    return out;
  }

  if (typeof value === 'string' && value.length > 2000) return `${value.slice(0, 2000)}…[truncated]`;
  return value;
}
