import { env } from '../config/environment';

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  dimensions: number;
}

export class EmbeddingService {
  private readonly defaultModel = env.mistralEmbeddingModel;
  private readonly embeddingSize = Number.isFinite(env.embeddingDim) && env.embeddingDim > 0 ? env.embeddingDim : 0;

  async generateEmbedding(input: string, model?: string): Promise<EmbeddingResponse> {
    if (!input || input.trim().length === 0) {
      throw new Error('Input text is required');
    }

    const selectedModel = (model ?? this.defaultModel).trim() || env.mistralEmbeddingModel.trim();

    if (!env.mistralApiKey) {
      throw new Error('MISTRAL_API_KEY is not configured in the environment');
    }

    if (!selectedModel) {
      throw new Error('MISTRAL_EMBEDDING_MODEL is not configured in the environment');
    }

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.mistralApiKey}`,
      },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({ model: selectedModel, input }),
    };
    let response = await fetch(
      'https://api.mistral.ai/v1/embeddings',
      requestOptions,
    );

    for (let attempt = 0; response.status === 429 && attempt < 2; attempt += 1) {
      const retryDelay = this.getRateLimitRetryDelay(response, attempt);
      if (retryDelay === null) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      response = await fetch(
        'https://api.mistral.ai/v1/embeddings',
        requestOptions,
      );
    }

    if (!response.ok) {
      throw new Error(`Embedding request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
    const embedding = payload.data?.[0]?.embedding;

    if (
      !Array.isArray(embedding) ||
      embedding.length === 0 ||
      !embedding.every(Number.isFinite)
    ) {
      throw new Error('Embedding response did not contain an embedding vector');
    }

    if (this.embeddingSize > 0 && embedding.length !== this.embeddingSize) {
      throw new Error(
        `Embedding dimensions did not match EMBEDDING_DIM (${embedding.length} received, ${this.embeddingSize} configured)`,
      );
    }

    return {
      embedding,
      model: selectedModel,
      dimensions: embedding.length,
    };
  }

  private getRateLimitRetryDelay(
    response: Response,
    attempt: number,
  ): number | null {
    if (response.status !== 429 || attempt >= 2) {
      return null;
    }

    const retryAfter = response.headers.get('retry-after');
    if (!retryAfter) {
      return null;
    }

    const seconds = Number(retryAfter);
    const delay = Number.isFinite(seconds)
      ? seconds * 1000
      : Date.parse(retryAfter) - Date.now();
    return Number.isFinite(delay) && delay >= 0 && delay <= 60_000
      ? delay
      : null;
  }
}
