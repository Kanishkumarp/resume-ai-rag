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

    if (!selectedModel) {
      throw new Error('MISTRAL_EMBEDDING_MODEL is not configured in the environment');
    }

    if (!env.mistralApiKey) {
      throw new Error('MISTRAL_API_KEY is not configured in the environment');
    }

    try {
      const response = await fetch('https://api.mistral.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.mistralApiKey}`,
        },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({ model: selectedModel, input }),
      });

      if (!response.ok) {
        throw new Error(`Mistral embedding request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
      const embedding = payload.data?.[0]?.embedding;

      if (!Array.isArray(embedding) || embedding.length === 0 || !embedding.every(Number.isFinite)) {
        throw new Error('Mistral embedding response did not contain a valid vector');
      }

      if (this.embeddingSize > 0 && embedding.length !== this.embeddingSize) {
        throw new Error(
          `Mistral embedding dimensions did not match EMBEDDING_DIM (${embedding.length} received, ${this.embeddingSize} configured)`,
        );
      }

      return {
        embedding,
        model: selectedModel,
        dimensions: embedding.length,
      };
    } catch (error) {
      throw error;
    }
  }
}
