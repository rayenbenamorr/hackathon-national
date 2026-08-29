/**
 * FAILURE HANDLING (§28).
 *
 * The rule the whole platform is measured against:
 *
 *   The student must read   "Transport integration is unavailable."
 *   The student must NOT read  ECONNREFUSED 172.18.0.12:4222
 *
 * Every cross-service failure is turned into one of these, with the human name
 * of the ministry, the reason, and the next action.
 */
export class DependencyUnavailableError extends Error {
  readonly statusCode = 424;
  override readonly name = 'DependencyUnavailableError';

  constructor(
    readonly caller: string,
    readonly dependency: string,
    readonly dependencyName: string,
    readonly reason: string,
    readonly hint: string,
  ) {
    super(`${dependencyName} integration is unavailable — ${reason}`);
  }

  toJSON(): Record<string, unknown> {
    return {
      error: 'dependency_unavailable',
      message: this.message,
      caller: this.caller,
      dependency: this.dependency,
      dependencyName: this.dependencyName,
      reason: this.reason,
      whatToDo: this.hint,
      degraded: true,
    };
  }
}

export class ServiceCallError extends Error {
  override readonly name = 'ServiceCallError';
  constructor(
    readonly statusCode: number,
    readonly service: string,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
  }
}
