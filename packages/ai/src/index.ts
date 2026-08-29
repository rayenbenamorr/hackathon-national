import { z } from 'zod';
import { zodToJsonSchema } from '@platform/contracts';
import { createLogger, recordHop, newTraceId } from '@platform/observability';
import { MockProvider } from './providers/mock.ts';
import { AnthropicProvider, OpenRouterProvider } from './providers/remote.ts';
import {
  AiUnavailableError,
  type AiProvider,
  type AiMessage,
  type AiToolDefinition,
  type ChatResult,
} from './provider.ts';
import { synthesizeFromSchema } from './synthesize.ts';
import { KnowledgeBase, buildRagPrompt, type RagDocument, type RagHit } from './rag.ts';
import { runAgent, type AgentRun } from './agent.ts';

export * from './provider.ts';
export * from './rag.ts';
export * from './agent.ts';
export { synthesizeFromSchema } from './synthesize.ts';

const log = createLogger({ service: 'ai' });

let provider: AiProvider | null = null;

/**
 * ONE PROVIDER FOR THE WHOLE PLATFORM.
 *
 * Chosen from AI_PROVIDER at first use, and — this is the part that matters —
 * it FALLS BACK TO MOCK instead of crashing. A hackathon room where the Wi-Fi
 * dies must not become a hackathon room where 24 services are down.
 */
export function aiProvider(): AiProvider {
  if (provider) return provider;
  const choice = process.env.AI_PROVIDER ?? 'mock';
  try {
    if (choice === 'openrouter') provider = new OpenRouterProvider();
    else if (choice === 'anthropic') provider = new AnthropicProvider();
    else provider = new MockProvider();
  } catch (error) {
    log.warn(
      `AI_PROVIDER="${choice}" could not start (${error instanceof Error ? error.message : error}). ` +
        'Falling back to the offline mock provider so the platform keeps working.',
    );
    provider = new MockProvider();
  }
  log.info(`AI provider: ${provider.name} (${provider.model})${provider.mock ? ' — offline mock mode' : ''}`);
  return provider;
}

export function setAiProvider(next: AiProvider | null): void {
  provider = next;
}

// ---------------------------------------------------------------------------
// Spend guard
// ---------------------------------------------------------------------------

const calls: number[] = [];
function guard(): void {
  const limit = Number(process.env.AI_MAX_CALLS_PER_MINUTE ?? 60);
  const now = Date.now();
  while (calls.length && now - calls[0] > 60_000) calls.shift();
  if (calls.length >= limit) {
    throw new AiUnavailableError(
      `AI rate limit reached (${limit} calls/minute). This guard exists so one runaway loop cannot burn a shared budget. ` +
        'Raise AI_MAX_CALLS_PER_MINUTE in .env if you really need more.',
    );
  }
  calls.push(now);
}

export interface AiUsageStat {
  service: string;
  calls: number;
  mock: boolean;
  lastAt?: string;
}
const usage = new Map<string, AiUsageStat>();
export function aiUsage(): AiUsageStat[] {
  return [...usage.values()].sort((a, b) => b.calls - a.calls);
}

// ---------------------------------------------------------------------------
// The client every service receives as `ctx.ai`
// ---------------------------------------------------------------------------

export interface AiClient {
  readonly provider: string;
  readonly model: string;
  readonly mock: boolean;

  chat(
    prompt: string,
    options?: { system?: string; temperature?: number; traceId?: string },
  ): Promise<string>;
  raw(messages: AiMessage[], options?: { system?: string; tools?: AiToolDefinition[] }): Promise<ChatResult>;

  /** Returns a value that ALWAYS validates against `schema`, key or no key. */
  structured<S extends z.ZodTypeAny>(
    schema: S,
    prompt: string,
    options?: { system?: string; traceId?: string; hints?: Record<string, unknown> },
  ): Promise<z.infer<S>>;

  embed(texts: string[]): Promise<number[][]>;
  classify<L extends string>(
    text: string,
    labels: readonly L[],
    options?: { traceId?: string },
  ): Promise<{ label: L; confidence: number }>;
  extract<S extends z.ZodTypeAny>(schema: S, text: string): Promise<z.infer<S>>;
  summarize(text: string, options?: { maxSentences?: number }): Promise<string>;
  recommend<T>(
    candidates: T[],
    goal: string,
    describe: (item: T) => string,
    limit?: number,
  ): Promise<Array<{ item: T; score: number; reason: string }>>;

  knowledgeBase(name: string): KnowledgeBase;
  rag(
    question: string,
    base: KnowledgeBase,
    options?: { k?: number },
  ): Promise<{ answer: string; sources: RagHit[] }>;
  agent(
    goal: string,
    tools: AiToolDefinition[],
    options?: { system?: string; maxSteps?: number },
  ): Promise<AgentRun>;
}

export function createAiClient(serviceId: string): AiClient {
  const bases = new Map<string, KnowledgeBase>();

  const track = (traceId: string | undefined, label: string, ok: boolean) => {
    const p = aiProvider();
    const stat = usage.get(serviceId) ?? { service: serviceId, calls: 0, mock: p.mock };
    stat.calls += 1;
    stat.mock = p.mock;
    stat.lastAt = new Date().toISOString();
    usage.set(serviceId, stat);
    recordHop({
      traceId: traceId ?? newTraceId(),
      kind: 'ai',
      from: serviceId,
      to: `ai:${p.name}`,
      label,
      ok,
      detail: { model: p.model, mock: p.mock },
    });
  };

  return {
    get provider() {
      return aiProvider().name;
    },
    get model() {
      return aiProvider().model;
    },
    get mock() {
      return aiProvider().mock;
    },

    async chat(prompt, options = {}) {
      guard();
      const result = await aiProvider().chat([{ role: 'user', content: prompt }], {
        system: options.system,
        temperature: options.temperature,
      });
      track(options.traceId, 'chat', true);
      return result.text;
    },

    async raw(messages, options = {}) {
      guard();
      const result = await aiProvider().chat(messages, options);
      track(undefined, 'chat', true);
      return result;
    },

    async structured(schema, prompt, options = {}) {
      guard();
      const p = aiProvider();

      if (p.mock) {
        track(options.traceId, 'structured(mock)', true);
        return applyHints(schema, synthesizeFromSchema(schema, prompt), options.hints);
      }

      const instruction = [
        options.system ?? 'You produce strictly valid JSON for a national services platform.',
        'Reply with JSON only. No prose, no markdown fence.',
        `It must satisfy this JSON Schema:\n${JSON.stringify(zodToJsonSchema(schema))}`,
      ].join('\n\n');

      const result = await p.chat([{ role: 'user', content: prompt }], {
        system: instruction,
        temperature: 0,
      });
      const parsed = schema.safeParse(extractJson(result.text));
      if (parsed.success) {
        track(options.traceId, 'structured', true);
        return parsed.data as z.infer<typeof schema>;
      }
      // A real model that drifts must not break a demo: fall back to a valid value.
      log.warn(
        `${serviceId}: the model returned JSON that failed the schema; falling back to a synthesised value.`,
        {
          service: serviceId,
          issues: parsed.error.issues.slice(0, 3).map((i) => i.message),
        },
      );
      track(options.traceId, 'structured(fallback)', false);
      return applyHints(schema, synthesizeFromSchema(schema, prompt), options.hints);
    },

    async embed(texts) {
      guard();
      return aiProvider().embed(texts);
    },

    async classify(text, labels, options = {}) {
      guard();
      const p = aiProvider();
      if (p.mock) {
        // Lexical nearest label — deterministic and explainable.
        const [textVector, ...labelVectors] = await p.embed([text, ...labels]);
        let best = 0;
        let bestScore = -1;
        labelVectors.forEach((vector, i) => {
          const score = vector.reduce((s, v, j) => s + v * textVector[j], 0);
          if (score > bestScore) {
            bestScore = score;
            best = i;
          }
        });
        track(options.traceId, 'classify(mock)', true);
        return {
          label: labels[best],
          confidence: Number(Math.max(0.35, Math.min(0.95, bestScore + 0.4)).toFixed(2)),
        };
      }
      const answer = await p.chat(
        [
          {
            role: 'user',
            content: `Classify this text into exactly one label from ${JSON.stringify(labels)}.\n\n${text}`,
          },
        ],
        { system: 'Reply with the label only.', temperature: 0 },
      );
      const found = labels.find((l) => answer.text.toLowerCase().includes(l.toLowerCase())) ?? labels[0];
      track(options.traceId, 'classify', true);
      return { label: found, confidence: 0.8 };
    },

    async extract(schema, text) {
      return this.structured(schema, `Extract the requested fields from the following text.\n\n${text}`);
    },

    async summarize(text, options = {}) {
      const max = options.maxSentences ?? 3;
      const p = aiProvider();
      if (p.mock) {
        track(undefined, 'summarize(mock)', true);
        const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
        const picked = sentences.slice(0, max).join(' ');
        return picked || '[MOCK AI] Nothing to summarise.';
      }
      return this.chat(`Summarise in at most ${max} sentences:\n\n${text}`, {
        system: 'Be factual and terse.',
      });
    },

    async recommend(candidates, goal, describe, limit = 5) {
      guard();
      const p = aiProvider();
      const [goalVector, ...vectors] = await p.embed([goal, ...candidates.map(describe)]);
      track(undefined, 'recommend', true);
      return candidates
        .map((item, i) => {
          const score = Number(vectors[i].reduce((s, v, j) => s + v * goalVector[j], 0).toFixed(4));
          return {
            item,
            score,
            reason:
              score > 0.15
                ? 'Strong overlap with the stated goal.'
                : 'Weak overlap; offered for completeness.',
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },

    knowledgeBase(name) {
      const key = `${serviceId}:${name}`;
      if (!bases.has(key)) bases.set(key, new KnowledgeBase(key, aiProvider()));
      return bases.get(key)!;
    },

    async rag(question, base, options = {}) {
      const sources = await base.search(question, options.k ?? 4);
      const answer = await this.chat(buildRagPrompt(question, sources), {
        system: 'You answer only from the provided sources and you cite them.',
      });
      return { answer, sources };
    },

    async agent(goal, tools, options = {}) {
      guard();
      const run = await runAgent(aiProvider(), {
        goal,
        tools,
        system: options.system,
        maxSteps: options.maxSteps,
      });
      track(undefined, `agent(${run.toolsUsed.join(',') || 'no-tool'})`, true);
      return run;
    },
  };
}

/**
 * Keeps a mocked answer COHERENT with the question.
 *
 * Without this, asking for a forecast about Kairouan returns a forecast about
 * a random governorate — technically valid, obviously wrong to a student
 * demonstrating their work. Any input field whose name matches an output field
 * is carried through, and only if the result still validates.
 */
function applyHints<S extends z.ZodTypeAny>(
  schema: S,
  base: z.infer<S>,
  hints?: Record<string, unknown>,
): z.infer<S> {
  if (!hints || typeof base !== 'object' || base === null) return base;
  const candidate = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(hints)) {
    if (value !== undefined && key in candidate) candidate[key] = value;
  }
  const parsed = schema.safeParse(candidate);
  return parsed.success ? (parsed.data as z.infer<S>) : base;
}

function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  try {
    return JSON.parse(start >= 0 && end > start ? body.slice(start, end + 1) : body);
  } catch {
    return {};
  }
}

export type { RagDocument };
