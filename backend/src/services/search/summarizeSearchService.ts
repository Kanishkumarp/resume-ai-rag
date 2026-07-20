import { LLMService } from '../llmService';
import { SearchCandidate } from '../../types/common';
import { env } from '../../config/environment';

export class SummarizeSearchService {
  constructor(private readonly llmService: LLMService = new LLMService()) {}

  async summarize(query: string, candidate: SearchCandidate, options?: { style?: 'short' | 'detailed'; maxTokens?: number }): Promise<string> {
    const style = options?.style === 'detailed' ? 'detailed' : env.summarizeDefaultStyle === 'detailed' ? 'detailed' : 'short';
    const maxTokens = typeof options?.maxTokens === 'number' && Number.isFinite(options.maxTokens)
      ? options.maxTokens
      : env.summarizeDefaultMaxTokens;

    return this.llmService.summarizeCandidateFit(query, candidate, { style, maxTokens });
  }
}
