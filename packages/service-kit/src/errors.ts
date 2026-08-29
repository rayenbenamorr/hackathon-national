/**
 * STRUCTURED ERRORS (§26).
 *
 * Every error a service can produce carries: a machine code, a sentence in
 * plain language, and — where possible — what to do next. The gateway adds the
 * traceId. A student pastes the whole body into Claude Code and it is enough to
 * act on.
 */
export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly detail?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class NotFoundError extends HttpError {
  constructor(what: string, id?: string) {
    super(404, 'not_found', id ? `${what} "${id}" does not exist.` : `${what} does not exist.`);
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, problems: string[]) {
    super(422, 'validation_failed', message, { problems });
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, detail?: Record<string, unknown>) {
    super(409, 'conflict', message, detail);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, detail?: Record<string, unknown>) {
    super(400, 'bad_request', message, detail);
  }
}

export interface ErrorBody {
  error: string;
  message: string;
  service: string;
  traceId: string;
  detail?: Record<string, unknown>;
  whatToDo?: string;
  degraded?: boolean;
}

export function toErrorBody(
  error: unknown,
  service: string,
  traceId: string,
): { status: number; body: ErrorBody } {
  // A dependency failure is not this service's fault; it must keep its shape.
  const maybe = error as { statusCode?: number; toJSON?: () => Record<string, unknown>; name?: string };

  if (maybe?.name === 'DependencyUnavailableError' && maybe.toJSON) {
    const json = maybe.toJSON();
    return {
      status: 424,
      body: {
        error: 'dependency_unavailable',
        message: String(json.message),
        service,
        traceId,
        degraded: true,
        whatToDo: String(json.whatToDo ?? ''),
        detail: json,
      },
    };
  }

  if (error instanceof HttpError) {
    return {
      status: error.statusCode,
      body: { error: error.code, message: error.message, service, traceId, detail: error.detail },
    };
  }

  const status = typeof maybe?.statusCode === 'number' ? maybe.statusCode : 500;
  const message = error instanceof Error ? error.message : String(error);

  return {
    status,
    body: {
      error: status === 500 ? 'internal_error' : 'error',
      message,
      service,
      traceId,
      whatToDo:
        status === 500
          ? `Open the portal at http://localhost:${process.env.PLATFORM_PORT ?? 4000}/#/service/${service} and look up trace ${traceId}.`
          : undefined,
    },
  };
}
