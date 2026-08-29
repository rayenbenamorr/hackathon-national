import { z } from 'zod';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  name?: string;
}

export interface AiToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

export interface ChatOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
  /** Names of tools the model may call. Empty means plain completion. */
  tools?: AiToolDefinition[];
}

export interface ChatResult {
  text: string;
  provider: string;
  model: string;
  toolCalls: Array<{ name: string; arguments: Record<string, unknown> }>;
  usage?: { inputTokens?: number; outputTokens?: number };
  /** True when nothing left the machine. Shown in the portal so nobody is fooled. */
  mock: boolean;
}

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  readonly mock: boolean;
  chat(messages: AiMessage[], options?: ChatOptions): Promise<ChatResult>;
  embed(texts: string[]): Promise<number[][]>;
}

export class AiUnavailableError extends Error {
  readonly statusCode = 424;
  constructor(message: string) {
    super(message);
    this.name = 'AiUnavailableError';
  }
}
