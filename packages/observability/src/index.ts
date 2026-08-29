export * from './ids.ts';
export * from './logger.ts';
export * from './redact.ts';
export * from './store.ts';

/**
 * The context every request and every event carries across the whole platform.
 * §27 of the brief: trace ID, correlation ID, source service — always.
 */
export interface TraceContext {
  traceId: string;
  correlationId: string;
  sourceService: string;
}
