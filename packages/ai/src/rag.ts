import type { AiProvider } from './provider.ts';

export interface RagDocument {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface RagHit extends RagDocument {
  score: number;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are stored normalised
}

/**
 * A vector store you can read.
 *
 * Everything is in memory and every hit carries its score, so a student can see
 * WHY a passage was retrieved. That visibility is worth more here than a real
 * vector database — and it means RAG works on a plane, offline, with no key.
 */
export class KnowledgeBase {
  private readonly docs: RagDocument[] = [];
  private readonly vectors: number[][] = [];

  constructor(
    readonly name: string,
    private readonly provider: AiProvider,
  ) {}

  get size(): number {
    return this.docs.length;
  }

  async add(documents: RagDocument[]): Promise<void> {
    if (documents.length === 0) return;
    const embeddings = await this.provider.embed(documents.map((d) => d.text));
    documents.forEach((doc, i) => {
      const existing = this.docs.findIndex((d) => d.id === doc.id);
      if (existing >= 0) {
        this.docs[existing] = doc;
        this.vectors[existing] = embeddings[i];
      } else {
        this.docs.push(doc);
        this.vectors.push(embeddings[i]);
      }
    });
  }

  async search(query: string, k = 4): Promise<RagHit[]> {
    if (this.docs.length === 0) return [];
    const [queryVector] = await this.provider.embed([query]);
    return this.docs
      .map((doc, i) => ({ ...doc, score: Number(cosine(queryVector, this.vectors[i]).toFixed(4)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .filter((hit) => hit.score > 0);
  }

  clear(): void {
    this.docs.length = 0;
    this.vectors.length = 0;
  }
}

export function buildRagPrompt(question: string, hits: RagHit[]): string {
  if (hits.length === 0) {
    return `Question: ${question}\n\nNo source document was retrieved. Say so instead of inventing an answer.`;
  }
  const sources = hits
    .map((hit, i) => `[${i + 1}] (id=${hit.id}, score=${hit.score})\n${hit.text}`)
    .join('\n\n');
  return [
    'Answer using ONLY the sources below. Cite them as [1], [2]. If the sources do not contain the answer,',
    'say that they do not — do not fill the gap from general knowledge.',
    '',
    '--- SOURCES ---',
    sources,
    '--- END SOURCES ---',
    '',
    `Question: ${question}`,
  ].join('\n');
}
