import {
  AiUnavailableError,
  type AiMessage,
  type AiProvider,
  type ChatOptions,
  type ChatResult,
} from '../provider.ts';
import { zodToJsonSchema } from '@platform/contracts';

/**
 * Real providers. Off by default, opt-in through .env, never a committed key.
 *
 * Both speak an OpenAI-shaped chat API (OpenRouter natively, Anthropic through
 * its own shape) so the adapter surface stays two methods wide. If a call
 * fails, it fails as `AiUnavailableError` — the service kit turns that into a
 * 424 with a sentence a beginner can read, not a stack trace.
 */
abstract class HttpProvider implements AiProvider {
  readonly mock = false;
  abstract readonly name: string;
  abstract readonly model: string;
  protected abstract endpoint(): string;
  protected abstract headers(): Record<string, string>;
  protected abstract body(messages: AiMessage[], options: ChatOptions): Record<string, unknown>;
  protected abstract parse(json: Record<string, unknown>): ChatResult;

  async chat(messages: AiMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    let response: Response;
    try {
      response = await fetch(this.endpoint(), {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...this.headers() },
        body: JSON.stringify(this.body(messages, options)),
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      throw new AiUnavailableError(
        `Could not reach the ${this.name} API (${error instanceof Error ? error.message : 'network error'}). ` +
          'Set AI_PROVIDER=mock in your .env to keep working offline.',
      );
    }
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new AiUnavailableError(
        `${this.name} returned HTTP ${response.status}. ${detail.slice(0, 300)}\n` +
          'Check your API key and credit, or set AI_PROVIDER=mock to keep working offline.',
      );
    }
    return this.parse((await response.json()) as Record<string, unknown>);
  }

  async embed(texts: string[]): Promise<number[][]> {
    // Neither provider is used for embeddings on this platform: the mock
    // embeddings are good enough for hackathon RAG and cost nothing. Kept
    // explicit rather than silently falling back to something worse.
    const { MockProvider } = await import('./mock.ts');
    return new MockProvider().embed(texts);
  }
}

export class OpenRouterProvider extends HttpProvider {
  readonly name = 'openrouter';
  readonly model = process.env.AI_MODEL ?? 'anthropic/claude-sonnet-5';

  constructor(private readonly apiKey = process.env.OPENROUTER_API_KEY ?? '') {
    super();
    if (!apiKey) {
      throw new AiUnavailableError(
        'AI_PROVIDER=openrouter but OPENROUTER_API_KEY is empty. Put the key in .env (never in the code) ' +
          'or set AI_PROVIDER=mock.',
      );
    }
  }

  protected endpoint(): string {
    return 'https://openrouter.ai/api/v1/chat/completions';
  }

  protected headers(): Record<string, string> {
    return {
      authorization: `Bearer ${this.apiKey}`,
      'x-title': 'Tunisia National Hackathon Platform',
    };
  }

  protected body(messages: AiMessage[], options: ChatOptions): Record<string, unknown> {
    return {
      model: this.model,
      messages: [...(options.system ? [{ role: 'system', content: options.system }] : []), ...messages],
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1200,
      ...(options.tools?.length
        ? {
            tools: options.tools.map((tool) => ({
              type: 'function',
              function: {
                name: tool.name,
                description: tool.description,
                parameters: zodToJsonSchema(tool.parameters),
              },
            })),
          }
        : {}),
    };
  }

  protected parse(json: Record<string, unknown>): ChatResult {
    const choice = (json.choices as Array<Record<string, never>> | undefined)?.[0] ?? {};
    const message = (choice as { message?: Record<string, unknown> }).message ?? {};
    const rawCalls = (message.tool_calls as Array<{ function: { name: string; arguments: string } }>) ?? [];
    return {
      text: (message.content as string) ?? '',
      provider: this.name,
      model: this.model,
      mock: false,
      toolCalls: rawCalls.map((c) => ({
        name: c.function.name,
        arguments: safeJson(c.function.arguments),
      })),
      usage: {
        inputTokens: (json.usage as { prompt_tokens?: number } | undefined)?.prompt_tokens,
        outputTokens: (json.usage as { completion_tokens?: number } | undefined)?.completion_tokens,
      },
    };
  }
}

export class AnthropicProvider extends HttpProvider {
  readonly name = 'anthropic';
  readonly model = process.env.AI_MODEL?.replace(/^anthropic\//, '') ?? 'claude-sonnet-5';

  constructor(private readonly apiKey = process.env.ANTHROPIC_API_KEY ?? '') {
    super();
    if (!apiKey) {
      throw new AiUnavailableError(
        'AI_PROVIDER=anthropic but ANTHROPIC_API_KEY is empty. Put the key in .env (never in the code) ' +
          'or set AI_PROVIDER=mock.',
      );
    }
  }

  protected endpoint(): string {
    return 'https://api.anthropic.com/v1/messages';
  }

  protected headers(): Record<string, string> {
    return { 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01' };
  }

  protected body(messages: AiMessage[], options: ChatOptions): Record<string, unknown> {
    return {
      model: this.model,
      max_tokens: options.maxTokens ?? 1200,
      temperature: options.temperature ?? 0.2,
      ...(options.system ? { system: options.system } : {}),
      messages: messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content })),
      ...(options.tools?.length
        ? {
            tools: options.tools.map((tool) => ({
              name: tool.name,
              description: tool.description,
              input_schema: zodToJsonSchema(tool.parameters),
            })),
          }
        : {}),
    };
  }

  protected parse(json: Record<string, unknown>): ChatResult {
    const blocks = (json.content as Array<Record<string, unknown>>) ?? [];
    return {
      text: blocks
        .filter((b) => b.type === 'text')
        .map((b) => b.text as string)
        .join('\n'),
      provider: this.name,
      model: this.model,
      mock: false,
      toolCalls: blocks
        .filter((b) => b.type === 'tool_use')
        .map((b) => ({ name: b.name as string, arguments: (b.input as Record<string, unknown>) ?? {} })),
      usage: {
        inputTokens: (json.usage as { input_tokens?: number } | undefined)?.input_tokens,
        outputTokens: (json.usage as { output_tokens?: number } | undefined)?.output_tokens,
      },
    };
  }
}

function safeJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}
