import { normalizeScores } from '../../utils/scoring';
import { HybridSearchResponse, SearchCandidate } from '../../types/common';
import { Bm25SearchService } from './bm25SearchService';
import { VectorSearchService } from './vectorSearchService';

interface WeightedCandidate extends SearchCandidate {
  bm25Score?: number;
  vectorScore?: number;
}

export class HybridSearchService {
  private lastQuery = '';

  constructor(
    private readonly bm25Service: Bm25SearchService = new Bm25SearchService(),
    private readonly vectorService: VectorSearchService = new VectorSearchService(),
  ) {}

  async search(
    query: string,
    filters: Record<string, unknown> = {},
    topK = 10,
    weights?: { bm25?: number; vector?: number },
  ): Promise<HybridSearchResponse> {
    this.lastQuery = query;
    const warnings: string[] = [];
    let bm25Results: SearchCandidate[] = [];
    let vectorResults: SearchCandidate[] = [];
    let bm25Fallback = false;
    let vectorFallback = false;
    let bm25Ms = 0;
    let vectorMs = 0;

    try {
      const startedAt = Date.now();
      bm25Results = await this.bm25Service.search(query, filters, topK);
      bm25Ms = Date.now() - startedAt;
    } catch (_error) {
      bm25Fallback = true;
      vectorFallback = true;
      warnings.push('BM25 search failed.');
    }

    try {
      const startedAt = Date.now();
      vectorResults = await this.vectorService.search(query, filters, topK);
      vectorMs = Date.now() - startedAt;
    } catch (_error) {
      bm25Fallback = true;
      vectorFallback = true;
      warnings.push('Vector search failed.');
    }

    if (bm25Results.length === 0 && vectorResults.length > 0) {
      bm25Fallback = true;
      warnings.push('BM25 search returned no results; using vector results only.');
    }

    if (vectorResults.length === 0 && bm25Results.length > 0) {
      vectorFallback = true;
      warnings.push('Vector search returned no results; using BM25 results only.');
    }

    if (bm25Results.length === 0 && vectorResults.length === 0) {
      bm25Fallback = true;
      vectorFallback = true;
      warnings.push('Both BM25 and vector searches returned no results; using demo fallback results.');
    }

    const results = this.mergeResults(bm25Results, vectorResults, weights);

    return {
      query,
      bm25Results,
      vectorResults,
      results,
      warnings,
      source: 'hybrid',
      index: await this.vectorService.getVectorIndexConfig(),
      vectorFallback,
      bm25Fallback,
      timings: { bm25Ms, vectorMs },
    } as HybridSearchResponse & { query: string };
  }

  private mergeResults(
    bm25Results: SearchCandidate[],
    vectorResults: SearchCandidate[],
    weights?: { bm25?: number; vector?: number },
  ): SearchCandidate[] {
    const byId = new Map<string, WeightedCandidate>();

    bm25Results.forEach((candidate) => {
      byId.set(candidate.resumeId, {
        ...candidate,
        bm25Score: this.extractBranchScore(candidate, 'bm25'),
        vectorScore: undefined,
      });
    });

    vectorResults.forEach((candidate) => {
      const existing = byId.get(candidate.resumeId);
      if (existing) {
        existing.vectorScore = this.extractBranchScore(candidate, 'vector');
      } else {
        byId.set(candidate.resumeId, {
          ...candidate,
          bm25Score: undefined,
          vectorScore: this.extractBranchScore(candidate, 'vector'),
        });
      }
    });

    const bm25Weight = this.normalizeWeight(weights?.bm25, 50);
    const vectorWeight = this.normalizeWeight(weights?.vector, 50);
    const topK = Math.max(1, Math.min(50, bm25Results.length + vectorResults.length));
    const bm25OnlyMode = bm25Weight > 0 && vectorWeight === 0;
    const vectorOnlyMode = vectorWeight > 0 && bm25Weight === 0;

    const bm25ReferenceScores = bm25Results.map((candidate) => this.extractBranchScore(candidate, 'bm25')).filter((score) => Number.isFinite(score));
    const vectorReferenceScores = vectorResults.map((candidate) => this.extractBranchScore(candidate, 'vector')).filter((score) => Number.isFinite(score));
    const normalizedBm25Scores = normalizeScores(bm25ReferenceScores);
    const normalizedVectorScores = normalizeScores(vectorReferenceScores);

    const merged = Array.from(byId.values())
      .filter((entry) => {
        if (bm25OnlyMode) {
          return typeof entry.bm25Score === 'number' && Number.isFinite(entry.bm25Score) && entry.bm25Score > 0;
        }

        if (vectorOnlyMode) {
          return typeof entry.vectorScore === 'number' && Number.isFinite(entry.vectorScore) && entry.vectorScore > 0;
        }

        return true;
      })
      .map((entry) => {
        const bm25Normalized = this.normalizeToComparableRange(entry.bm25Score, bm25ReferenceScores, normalizedBm25Scores);
        const vectorNormalized = this.normalizeToComparableRange(entry.vectorScore, vectorReferenceScores, normalizedVectorScores);
        const hasBm25 = typeof entry.bm25Score === 'number' && Number.isFinite(entry.bm25Score) && entry.bm25Score > 0;
        const hasVector = typeof entry.vectorScore === 'number' && Number.isFinite(entry.vectorScore) && entry.vectorScore > 0;

        let hybridScore = 0;
        if (hasBm25 && hasVector) {
          hybridScore = Number(((bm25Weight * bm25Normalized) + (vectorWeight * vectorNormalized)).toFixed(6));
        } else if (hasBm25) {
          hybridScore = Number((bm25Weight * bm25Normalized).toFixed(6));
        } else if (hasVector) {
          hybridScore = Number((vectorWeight * vectorNormalized).toFixed(6));
        }

        const normalizedHybridScore = Number(Math.max(0, Math.min(1, hybridScore)).toFixed(6));

        return {
          ...entry,
          score: normalizedHybridScore,
          source: 'hybrid' as const,
          matchType: 'hybrid' as const,
          bm25Score: Number(bm25Normalized.toFixed(6)),
          vectorScore: Number(vectorNormalized.toFixed(6)),
          hybridScore: normalizedHybridScore,
        };
      });

    return merged
      .sort((left, right) => right.hybridScore - left.hybridScore)
      .slice(0, topK)
      .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
  }

  private extractBranchScore(candidate: SearchCandidate, branch: 'bm25' | 'vector'): number {
    if (branch === 'bm25') {
      const explicitScore = (candidate as SearchCandidate & { bm25Score?: number }).bm25Score;
      if (typeof explicitScore === 'number' && Number.isFinite(explicitScore)) {
        return explicitScore;
      }
    }

    if (branch === 'vector') {
      const explicitScore = (candidate as SearchCandidate & { vectorScore?: number }).vectorScore;
      if (typeof explicitScore === 'number' && Number.isFinite(explicitScore)) {
        return explicitScore;
      }
    }

    return Number(candidate.score ?? 0);
  }

  private normalizeWeight(value: number | undefined, fallback: number): number {
    const numericValue = Number(value ?? fallback);
    if (!Number.isFinite(numericValue)) {
      return fallback <= 1 ? fallback : fallback / 100;
    }

    if (numericValue <= 1) {
      return Math.max(0, Math.min(1, numericValue));
    }

    return Math.max(0, Math.min(1, numericValue / 100));
  }

  private normalizeToComparableRange(
    score: number | undefined,
    originalScores: number[],
    normalizedScores: number[],
  ): number {
    if (typeof score !== 'number' || !Number.isFinite(score)) {
      return 0;
    }

    const index = originalScores.indexOf(score);
    if (index >= 0 && index < normalizedScores.length) {
      return normalizedScores[index];
    }

    const min = Math.min(...originalScores);
    const max = Math.max(...originalScores);
    if (max === min) {
      return score > 0 ? 1 : 0;
    }

    return Number(Math.max(0, Math.min(1, (score - min) / (max - min))).toFixed(6));
  }
}
