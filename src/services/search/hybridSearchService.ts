import { HybridSearchResponse, SearchCandidate } from "../../types/common";
import { Bm25SearchService } from "./bm25SearchService";
import { VectorSearchService } from "./vectorSearchService";
import type { SearchFilters } from "./searchFilters";

interface WeightedCandidate extends SearchCandidate {
  bm25Score?: number;
  vectorScore?: number;
  bm25RawScore?: number;
  vectorRawScore?: number;
}

export class HybridSearchService {
  private lastQuery = "";

  constructor(
    private readonly bm25Service: Bm25SearchService = new Bm25SearchService(),
    private readonly vectorService: VectorSearchService = new VectorSearchService(),
  ) {}

  async search(
    query: string,
    filters: SearchFilters = {},
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
      warnings.push("BM25 search failed.");
    }

    try {
      const startedAt = Date.now();
      vectorResults = await this.vectorService.search(query, filters, topK);
      vectorMs = Date.now() - startedAt;
    } catch (_error) {
      vectorFallback = true;
      warnings.push("Vector search failed.");
    }

    if (bm25Results.length === 0 && vectorResults.length > 0) {
      bm25Fallback = true;
      warnings.push(
        "BM25 search returned no results; using vector results only.",
      );
    }

    if (vectorResults.length === 0 && bm25Results.length > 0) {
      vectorFallback = true;
      warnings.push(
        "Vector search returned no results; using BM25 results only. If this collection contains resumes ingested before versioned embeddings were added, configure MISTRAL_API_KEY and run npm run reindex:embeddings to make them available to semantic search.",
      );
    }

    if (bm25Results.length === 0 && vectorResults.length === 0) {
      bm25Fallback = true;
      vectorFallback = true;
      warnings.push("BM25 and vector search returned no resume matches.");
    }

    const results = this.mergeResults(
      bm25Results,
      vectorResults,
      weights,
      topK,
    );

    return {
      query,
      bm25Results,
      vectorResults,
      results,
      warnings,
      source: "hybrid",
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
    topK = 50,
  ): SearchCandidate[] {
    const byId = new Map<string, WeightedCandidate>();

    bm25Results.forEach((candidate) => {
      byId.set(candidate.resumeId, {
        ...candidate,
        bm25Score: this.extractBranchScore(candidate, "bm25"),
        bm25RawScore: this.extractRawBranchScore(candidate, "bm25"),
        vectorScore: undefined,
        vectorRawScore: undefined,
      });
    });

    vectorResults.forEach((candidate) => {
      const existing = byId.get(candidate.resumeId);
      if (existing) {
        existing.vectorScore = this.extractBranchScore(candidate, "vector");
        existing.vectorRawScore = this.extractRawBranchScore(
          candidate,
          "vector",
        );
      } else {
        byId.set(candidate.resumeId, {
          ...candidate,
          bm25Score: undefined,
          bm25RawScore: undefined,
          vectorScore: this.extractBranchScore(candidate, "vector"),
          vectorRawScore: this.extractRawBranchScore(candidate, "vector"),
        });
      }
    });

    const bm25Weight = this.normalizeWeight(weights?.bm25, 50);
    const vectorWeight = this.normalizeWeight(weights?.vector, 50);
    const resultLimit = Math.max(0, Math.min(50, topK));
    const bm25OnlyMode = bm25Weight > 0 && vectorWeight === 0;
    const vectorOnlyMode = vectorWeight > 0 && bm25Weight === 0;

    const bm25ReferenceScores = bm25Results
      .map((candidate) => this.extractBranchScore(candidate, "bm25"))
      .filter((score) => Number.isFinite(score));
    const vectorReferenceScores = vectorResults
      .map((candidate) => this.extractBranchScore(candidate, "vector"))
      .filter((score) => Number.isFinite(score));
    const bm25Max =
      bm25ReferenceScores.length > 0 ? Math.max(...bm25ReferenceScores) : 1;
    const vectorMax =
      vectorReferenceScores.length > 0 ? Math.max(...vectorReferenceScores) : 1;

    const merged = Array.from(byId.values())
      .filter((entry) => {
        if (bm25OnlyMode) {
          return (
            typeof entry.bm25Score === "number" &&
            Number.isFinite(entry.bm25Score) &&
            entry.bm25Score > 0
          );
        }

        if (vectorOnlyMode) {
          return (
            typeof entry.vectorScore === "number" &&
            Number.isFinite(entry.vectorScore) &&
            entry.vectorScore > 0
          );
        }

        return (
          (typeof entry.bm25Score === "number" &&
            Number.isFinite(entry.bm25Score) &&
            entry.bm25Score > 0) ||
          (typeof entry.vectorScore === "number" &&
            Number.isFinite(entry.vectorScore) &&
            entry.vectorScore > 0)
        );
      })
      .map((entry) => {
        const bm25Normalized = this.normalizeToComparableRange(
          entry.bm25Score,
          bm25Max,
        );
        const vectorNormalized = this.normalizeToComparableRange(
          entry.vectorScore,
          vectorMax,
        );
        const hasBm25 =
          typeof entry.bm25Score === "number" &&
          Number.isFinite(entry.bm25Score) &&
          entry.bm25Score > 0;
        const hasVector =
          typeof entry.vectorScore === "number" &&
          Number.isFinite(entry.vectorScore) &&
          entry.vectorScore > 0;

        let hybridScore = 0;
        if (hasBm25 && hasVector) {
          hybridScore = Number(
            (
              bm25Weight * bm25Normalized +
              vectorWeight * vectorNormalized
            ).toFixed(3),
          );
        } else if (hasBm25) {
          hybridScore = Number((bm25Weight * bm25Normalized).toFixed(3));
        } else if (hasVector) {
          hybridScore = Number((vectorWeight * vectorNormalized).toFixed(3));
        }

        return {
          ...entry,
          score: hybridScore,
          source: "hybrid" as const,
          matchType: "hybrid" as const,
          bm25Score: Number(bm25Normalized.toFixed(3)),
          vectorScore: Number(vectorNormalized.toFixed(3)),
          hybridScore,
        };
      });

    return merged
      .sort((left, right) => right.hybridScore - left.hybridScore)
      .slice(0, resultLimit)
      .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
  }

  private extractBranchScore(
    candidate: SearchCandidate,
    branch: "bm25" | "vector",
  ): number {
    if (branch === "bm25") {
      const explicitScore = (
        candidate as SearchCandidate & { bm25Score?: number }
      ).bm25Score;
      if (typeof explicitScore === "number" && Number.isFinite(explicitScore)) {
        return explicitScore;
      }
    }

    if (branch === "vector") {
      const explicitScore = (
        candidate as SearchCandidate & { vectorScore?: number }
      ).vectorScore;
      if (typeof explicitScore === "number" && Number.isFinite(explicitScore)) {
        return explicitScore;
      }
    }

    return Number(candidate.score ?? 0);
  }

  private extractRawBranchScore(
    candidate: SearchCandidate,
    branch: "bm25" | "vector",
  ): number {
    const rawScore =
      branch === "bm25" ? candidate.bm25RawScore : candidate.vectorRawScore;
    if (typeof rawScore === "number" && Number.isFinite(rawScore)) {
      return rawScore;
    }
    return this.extractBranchScore(candidate, branch);
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
    referenceMax: number,
  ): number {
    if (typeof score !== "number" || !Number.isFinite(score)) {
      return 0;
    }

    if (referenceMax <= 0) {
      return score > 0 ? 1 : 0;
    }

    return Number(Math.max(0, Math.min(1, score / referenceMax)).toFixed(3));
  }
}
