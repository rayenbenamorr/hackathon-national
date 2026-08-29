import { redact } from './redact.ts';
import { recordLog } from './store.ts';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function threshold(): number {
  const raw = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel;
  return ORDER[raw] ?? ORDER.info;
}

export interface LogFields {
  service?: string;
  traceId?: string;
  correlationId?: string;
  eventType?: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(fields: LogFields): Logger;
}

const COLOURS: Record<LogLevel, string> = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';

const useJson = process.env.LOG_FORMAT === 'json';

function emit(level: LogLevel, message: string, fields: LogFields): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(redact(fields) as Record<string, unknown>),
  };

  // The portal reads this buffer; students see their own logs without a terminal.
  recordLog(entry);

  if (ORDER[level] < threshold()) return;

  if (useJson) {
    process.stdout.write(`${JSON.stringify(entry)}\n`);
    return;
  }

  const svc = fields.service ? `\x1b[35m[${fields.service}]${RESET} ` : '';
  const rest = { ...fields };
  delete rest.service;
  const tail = Object.keys(rest).length ? ` \x1b[90m${JSON.stringify(redact(rest))}${RESET}` : '';
  process.stdout.write(`${COLOURS[level]}${level.padEnd(5)}${RESET} ${svc}${message}${tail}\n`);
}

export function createLogger(base: LogFields = {}): Logger {
  const make = (fields: LogFields): Logger => ({
    debug: (m, f) => emit('debug', m, { ...fields, ...f }),
    info: (m, f) => emit('info', m, { ...fields, ...f }),
    warn: (m, f) => emit('warn', m, { ...fields, ...f }),
    error: (m, f) => emit('error', m, { ...fields, ...f }),
    child: (f) => make({ ...fields, ...f }),
  });
  return make(base);
}

export const logger = createLogger();
