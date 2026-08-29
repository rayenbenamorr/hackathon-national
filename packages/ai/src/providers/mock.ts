import { createHash } from 'node:crypto';
import type { AiMessage, AiProvider, ChatOptions, ChatResult } from '../provider.ts';

const EMBEDDING_DIM = 128;

/**
 * Deterministic offline provider. DEFAULT for the whole hackathon.
 *
 * Embeddings are a hashed bag-of-words projected onto 128 dimensions. That is
 * not semantic — but it IS lexical, which means RAG demonstrably retrieves the
 * right paragraph in a demo, and switching `AI_PROVIDER=openrouter` later
 * changes the quality without changing a single line of student code.
 */
export class MockProvider implements AiProvider {
  readonly name = 'mock';
  readonly model = 'mock-deterministic-v1';
  readonly mock = true;

  async chat(messages: AiMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const user = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    const seed = createHash('sha256').update(user).digest('hex').slice(0, 8);

    // If tools are offered, pick the one whose description overlaps the request
    // most. Enough for a student to see an agent loop actually loop.
    const toolCalls: ChatResult['toolCalls'] = [];
    if (options.tools?.length) {
      const scored = options.tools
        .map((tool) => ({ tool, score: overlap(user, `${tool.name} ${tool.description}`) }))
        .sort((a, b) => b.score - a.score);
      if (scored[0] && scored[0].score > 0) {
        toolCalls.push({ name: scored[0].tool.name, arguments: {} });
      }
    }

    return {
      text: composeAnswer(user, seed),
      provider: this.name,
      model: this.model,
      toolCalls,
      mock: true,
      usage: { inputTokens: approxTokens(messages), outputTokens: 80 },
    };
  }

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => {
      const vector = new Array<number>(EMBEDDING_DIM).fill(0);
      for (const token of tokenize(text)) {
        const h = createHash('md5').update(token).digest();
        vector[h[0] % EMBEDDING_DIM] += 1;
        vector[h[1] % EMBEDDING_DIM] += 0.5;
      }
      const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
      return vector.map((v) => v / norm);
    });
  }
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

function overlap(a: string, b: string): number {
  const setB = new Set(tokenize(b));
  return tokenize(a).filter((t) => setB.has(t)).length;
}

function approxTokens(messages: AiMessage[]): number {
  return Math.ceil(messages.reduce((s, m) => s + m.content.length, 0) / 4);
}

function composeAnswer(question: string, seed: string): string {
  const topic = tokenize(question).slice(0, 6).join(', ') || 'the request';
  return [
    `[MOCK AI — no model was called, no data left this machine]`,
    ``,
    `Request understood around: ${topic}.`,
    ``,
    `1. The available synthetic observations are consistent with the seasonal baseline.`,
    `2. One cross-sector dependency is worth checking before acting on this.`,
    `3. Confidence is deliberately moderate: this answer is generated offline.`,
    ``,
    `Set AI_PROVIDER=openrouter (or anthropic) in your .env with a key to get a real model.`,
    `Deterministic seed: ${seed}`,
  ].join('\n');
}
