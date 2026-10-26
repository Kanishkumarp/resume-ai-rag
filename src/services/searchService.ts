import { HybridSearchResponse, SearchCandidate } from "../types/common";
import { Bm25SearchService } from "./search/bm25SearchService";
import { HybridSearchService } from "./search/hybridSearchService";
import { RerankSearchService } from "./search/rerankSearchService";
import { SummarizeSearchService } from "./search/summarizeSearchService";
import { VectorSearchService } from "./search/vectorSearchService";
import { LLMService } from "./llmService";
import { normalizeSearchFilters, SearchFilters } from "./search/searchFilters";

export class SearchService {
  private readonly bm25Service = new Bm25SearchService();
  private readonly vectorService = new VectorSearchService();
  private readonly hybridService = new HybridSearchService(
    this.bm25Service,
    this.vectorService,
  );
  private readonly rerankService = new RerankSearchService();
  private readonly summarizeService = new SummarizeSearchService();
  private readonly llmService = new LLMService();

  async bm25Search(
    query: string,
    filters: unknown = {},
    topK = 10,
  ): Promise<SearchCandidate[]> {
    return this.bm25Service.search(
      query,
      normalizeSearchFilters(filters),
      topK,
    );
  }

  async vectorSearch(
    query: string,
    filters: unknown = {},
    topK = 10,
  ): Promise<SearchCandidate[]> {
    return this.vectorService.search(
      query,
      normalizeSearchFilters(filters),
      topK,
    );
  }

  async getVectorIndexConfig(): Promise<{
    name: string;
    dimensions: number;
    similarity: "cosine";
  }> {
    return this.vectorService.getVectorIndexConfig();
  }

  async hybridSearch(
    query: string,
    filters: unknown = {},
    topK = 10,
    weights?: { bm25?: number; vector?: number },
  ): Promise<HybridSearchResponse> {
    return this.hybridService.search(
      query,
      normalizeSearchFilters(filters),
      topK,
      weights,
    );
  }

  async rerankCandidates(
    query: string,
    candidates: SearchCandidate[],
    topK = 10,
  ): Promise<{
    results: SearchCandidate[];
    timings: { rerankMs: number };
    warnings: string[];
    rerankApplied: boolean;
  }> {
    return this.rerankService.rerank(query, candidates, topK);
  }

  async hybridSearchWithReranking(
    query: string,
    filters: unknown = {},
    topK = 10,
    weights?: { bm25?: number; vector?: number },
  ): Promise<HybridSearchResponse> {
    const candidatePoolSize = Math.min(50, Math.max(topK, topK * 3));
    const hybrid = await this.hybridService.search(
      query,
      normalizeSearchFilters(filters),
      candidatePoolSize,
      weights,
    );
    const reranked = await this.rerankCandidates(query, hybrid.results, topK);

    return {
      ...hybrid,
      hybridResults: hybrid.results,
      results: reranked.results,
      warnings: [...hybrid.warnings, ...reranked.warnings],
      timings: { ...hybrid.timings, rerankMs: reranked.timings.rerankMs },
      rerankApplied: reranked.rerankApplied,
    };
  }

  async summarizeCandidate(
    query: string,
    candidate: SearchCandidate,
    options?: { style?: "short" | "detailed"; maxTokens?: number },
  ): Promise<string> {
    return this.summarizeService.summarize(query, candidate, options);
  }

  async generateAnswer(
    query: string,
    candidates: SearchCandidate[],
    options?: { maxTokens?: number },
  ): Promise<string> {
    return this.llmService.generateAnswer(query, candidates, options);
  }

  async endToEndSearch(
    query: string,
    filters: unknown = {},
    options: {
      topK?: number;
      summarize?: boolean;
      style?: "short" | "detailed";
      maxTokens?: number;
      generateAnswer?: boolean;
      weights?: { bm25?: number; vector?: number };
    } = {},
  ): Promise<{
    query: string;
    results: SearchCandidate[];
    warnings: string[];
    bm25Results: SearchCandidate[];
    vectorResults: SearchCandidate[];
    hybridResults: SearchCandidate[];
    rerankApplied: boolean;
    timings: { bm25Ms: number; vectorMs: number; rerankMs: number };
    answer?: string;
  }> {
    const topK = options.topK ?? 10;
    const warnings: string[] = [];
    const normalizedFilters: SearchFilters = normalizeSearchFilters(filters);
    const hybrid = await this.hybridService.search(
      query,
      normalizedFilters,
      Math.min(50, Math.max(topK, topK * 3)),
      options.weights,
    );
    const { bm25Results, vectorResults } = hybrid;
    const merged = hybrid.results;
    warnings.push(...hybrid.warnings);

    let results = merged;
    let rerankApplied = false;
    let answer = "";
    let rerankMs = 0;

    try {
      const rerankResult = await this.rerankCandidates(query, merged, topK);
      results = rerankResult.results;
      rerankApplied = rerankResult.rerankApplied;
      rerankMs = rerankResult.timings.rerankMs;
      if (rerankResult.warnings.length > 0) {
        warnings.push(...rerankResult.warnings);
      }
    } catch (_error) {
      warnings.push("Reranking failed, using merged BM25/vector ordering.");
    }

    if (options.summarize) {
      const summaries = await Promise.all(
        results.slice(0, Math.min(topK, 5)).map(async (candidate) => ({
          candidate,
          summary: await this.summarizeCandidate(query, candidate, {
            style: options.style,
            maxTokens: options.maxTokens,
          }),
        })),
      );

      results = results.map((candidate) => {
        const match = summaries.find(
          (entry) => entry.candidate.resumeId === candidate.resumeId,
        );
        return {
          ...candidate,
          summary: match?.summary,
        };
      });
    }

    if (options.generateAnswer) {
      answer = await this.generateAnswer(
        query,
        results.slice(0, Math.min(topK, 5)),
        { maxTokens: options.maxTokens },
      );
    }

    return {
      query,
      results,
      warnings,
      bm25Results: bm25Results.length > 0 ? bm25Results : [],
      vectorResults: vectorResults.length > 0 ? vectorResults : [],
      hybridResults: merged.length > 0 ? merged : [],
      rerankApplied,
      timings: { ...hybrid.timings, rerankMs },
      answer: options.generateAnswer ? answer : undefined,
    };
  }
}
