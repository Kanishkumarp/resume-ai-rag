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
      return this.createFallbackEmbedding(input, 'fallback');
    }

    if (!env.mistralApiKey) {
      return this.createFallbackEmbedding(input, selectedModel);
    }

    try {
      const response = await fetch('https://api.mistral.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.mistralApiKey}`,
        },
        body: JSON.stringify({ model: selectedModel, input }),
      });

      if (!response.ok) {
        console.warn(`[embedding] Mistral request failed with status ${response.status}`);
        return this.createFallbackEmbedding(input, selectedModel);
      }

      const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
      const embedding = payload.data?.[0]?.embedding;

      if (!Array.isArray(embedding) || embedding.length === 0) {
        console.warn('[embedding] Mistral response did not contain a valid embedding vector');
        return this.createFallbackEmbedding(input, selectedModel);
      }

      return {
        embedding,
        model: selectedModel,
        dimensions: this.embeddingSize > 0 ? this.embeddingSize : embedding.length,
      };
    } catch (error) {
      console.warn('[embedding] Mistral embedding request failed', error);
      return this.createFallbackEmbedding(input, selectedModel);
    }
  }

  private createFallbackEmbedding(input: string, model: string): EmbeddingResponse {
    const values: number[] = [];
    const seed = input.length % 7;
    const size = this.embeddingSize > 0 ? this.embeddingSize : 16;

    for (let index = 0; index < size; index += 1) {
      const value = Math.sin((index + 1) * (seed + 1)) * 0.5 + 0.5;
      values.push(Number(value.toFixed(6)));
    }

    return {
      embedding: values,
      model: model || 'fallback',
      dimensions: values.length,
    };
  }
}
