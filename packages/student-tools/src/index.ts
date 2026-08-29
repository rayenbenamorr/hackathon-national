/**
 * STUDENT TOOLS
 *
 * Small helpers aimed at the person, not the machine: check that an environment
 * is sane, explain a failure in one sentence, point at the next command.
 */
export interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
  fix?: string;
  warning?: boolean;
}

export function pass(name: string, detail: string): CheckResult {
  return { name, ok: true, detail };
}

export function fail(name: string, detail: string, fix: string): CheckResult {
  return { name, ok: false, detail, fix };
}

export function warn(name: string, detail: string, fix?: string): CheckResult {
  return { name, ok: true, warning: true, detail, fix };
}

export function renderChecks(results: CheckResult[]): string {
  const lines: string[] = [];
  for (const result of results) {
    const icon = result.ok ? (result.warning ? '!' : '✓') : '✗';
    lines.push(`  ${icon}  ${result.name.padEnd(30)} ${result.detail}`);
    if (result.fix) lines.push(`     ${''.padEnd(30)} → ${result.fix}`);
  }
  return lines.join('\n');
}

export function summarise(results: CheckResult[]): { failed: number; warned: number; passed: number } {
  return {
    failed: results.filter((r) => !r.ok).length,
    warned: results.filter((r) => r.ok && r.warning).length,
    passed: results.filter((r) => r.ok && !r.warning).length,
  };
}

/** Is the platform answering on this port? */
export async function probePlatform(port: number): Promise<{ up: boolean; detail: string; body?: unknown }> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/__platform/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { up: false, detail: `answered HTTP ${response.status}` };
    return { up: true, detail: 'answering', body: await response.json() };
  } catch {
    return { up: false, detail: 'not answering' };
  }
}
