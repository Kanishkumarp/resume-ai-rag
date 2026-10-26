import { LLMService } from '../llmService';
import { SearchCandidate } from '../../types/common';

export class RerankSearchService {
  constructor(private readonly llmService: LLMService = new LLMService()) {}

  async rerank(query: string, candidates: SearchCandidate[], topK = 10): Promise<{
    results: SearchCandidate[];
    timings: { rerankMs: number };
    warnings: string[];
    rerankApplied: boolean;
  }> {
    const reranked = await this.llmService.rerankCandidates(query, candidates, topK);

    return {
      results: reranked.results
        .filter((candidate): candidate is typeof candidate & { resumeId: string } => typeof candidate.resumeId === 'string')
        .map((candidate, index) => ({ ...candidate, rank: index + 1 })) as SearchCandidate[],
      timings: reranked.timings,
      warnings: reranked.warnings,
      rerankApplied: reranked.rerankApplied,
    };
  }
}
