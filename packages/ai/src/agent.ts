import type { AiMessage, AiProvider, AiToolDefinition } from './provider.ts';

export interface AgentStep {
  step: number;
  thought: string;
  tool?: string;
  arguments?: Record<string, unknown>;
  observation?: unknown;
}

export interface AgentRun {
  goal: string;
  answer: string;
  steps: AgentStep[];
  toolsUsed: string[];
  mock: boolean;
}

/**
 * A small, honest agent loop: think → call a tool → observe → repeat.
 *
 * It is capped at `maxSteps` and every step is returned, not just the answer,
 * because the pedagogical value of an agent is watching it decide. In mock mode
 * the tool choice is lexical rather than reasoned — the LOOP is real, the
 * reasoning is not, and the result says so.
 */
export async function runAgent(
  provider: AiProvider,
  options: {
    goal: string;
    tools: AiToolDefinition[];
    system?: string;
    maxSteps?: number;
  },
): Promise<AgentRun> {
  const maxSteps = options.maxSteps ?? 4;
  const steps: AgentStep[] = [];
  const toolsUsed: string[] = [];

  const messages: AiMessage[] = [{ role: 'user', content: options.goal }];
  let answer = '';

  for (let step = 1; step <= maxSteps; step++) {
    const result = await provider.chat(messages, {
      system:
        options.system ??
        'You coordinate national services. Use a tool when it would give you a fact you do not have. ' +
          'When you have enough, answer directly and cite which tools you used.',
      tools: options.tools,
    });

    answer = result.text;

    const call = result.toolCalls[0];
    if (!call) {
      steps.push({ step, thought: result.text.slice(0, 400) });
      break;
    }

    const tool = options.tools.find((t) => t.name === call.name);
    if (!tool) {
      steps.push({ step, thought: `Requested unknown tool "${call.name}".` });
      break;
    }

    let observation: unknown;
    try {
      const parsed = tool.parameters.safeParse(call.arguments);
      observation = await tool.execute(
        parsed.success ? (parsed.data as Record<string, unknown>) : call.arguments,
      );
    } catch (error) {
      observation = { error: error instanceof Error ? error.message : String(error) };
    }

    toolsUsed.push(tool.name);
    steps.push({
      step,
      thought: result.text.slice(0, 200),
      tool: tool.name,
      arguments: call.arguments,
      observation,
    });

    messages.push({ role: 'assistant', content: `Calling ${tool.name}` });
    messages.push({ role: 'tool', name: tool.name, content: JSON.stringify(observation).slice(0, 4000) });

    // Mock mode would otherwise pick the same tool forever.
    if (provider.mock && toolsUsed.length >= 1) {
      const final = await provider.chat(messages, { system: options.system });
      answer = final.text;
      break;
    }
  }

  return { goal: options.goal, answer, steps, toolsUsed: [...new Set(toolsUsed)], mock: provider.mock };
}
