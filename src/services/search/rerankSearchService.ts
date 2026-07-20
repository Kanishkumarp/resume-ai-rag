import { LLMService } from '../llmService';
import { SearchCandidate } from '../../types/common';

export class RerankSearchService {
  constructor(private readonly llmService: LLMService = new LLMService()) {}

  async rerank(query: string, candidates: SearchCandidate[], topK = 10): Promise<{ results: SearchCandidate[]; timings: { rerankMs: number }; warnings: string[] }> {
    const reranked = await this.llmService.rerankCandidates(query, candidates, topK);

    return {
      results: reranked.results.map((candidate, index) => ({
        resumeId: candidate.resumeId ?? `${candidate.name ?? 'resume'}-${index + 1}`,
        name: candidate.name,
        company: candidate.company,
        role: candidate.role,
        snippet: candidate.snippet ?? '',
        score: candidate.source === 'hybrid' || candidate.matchType === 'hybrid'
          ? Number(candidate.hybridScore ?? candidate.score ?? 0)
          : candidate.source === 'vector' || candidate.matchType === 'vector'
            ? Number(candidate.score ?? 0)
            : Number(candidate.score ?? 0),
        source: candidate.source ?? 'hybrid',
        matchType: candidate.matchType ?? 'hybrid',
        rank: index + 1,
        summary: candidate.summary,
        bm25Score: candidate.source === 'hybrid' || candidate.matchType === 'hybrid'
          ? (typeof candidate.bm25Score === 'number' ? Number(candidate.bm25Score) : undefined)
          : undefined,
        vectorScore: candidate.source === 'hybrid' || candidate.matchType === 'hybrid'
          ? (typeof candidate.vectorScore === 'number' ? Number(candidate.vectorScore) : undefined)
          : undefined,
        hybridScore: candidate.source === 'hybrid' || candidate.matchType === 'hybrid'
          ? (typeof candidate.hybridScore === 'number' ? Number(candidate.hybridScore) : Number(candidate.score ?? 0))
          : undefined,
      })),
      timings: reranked.timings,
      warnings: reranked.warnings,
    };
  }
}
