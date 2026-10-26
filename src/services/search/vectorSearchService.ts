import { env } from "../../config/environment";
import { ResumeRepository } from "../../repositories/resumeRepository";
import { SearchCandidate } from "../../types/common";
import type { SearchFilters } from "./searchFilters";

export class VectorSearchService {
  constructor(
    private readonly repository: ResumeRepository = new ResumeRepository(),
  ) {}

  async search(
    query: string,
    filters: SearchFilters = {},
    topK = 10,
  ): Promise<SearchCandidate[]> {
    const candidatePoolSize = Math.max(topK * 4, 20);

    const results = await this.repository.searchByEmbedding(
      query,
      filters,
      candidatePoolSize,
    );
    const candidates = results.map((document, index) =>
      this.toCandidate(document, index),
    );
    return this.normalizeScores(candidates).slice(0, candidatePoolSize);
  }

  async getVectorIndexConfig(): Promise<{
    name: string;
    dimensions: number;
    similarity: "cosine";
  }> {
    const config = await this.repository.getVectorIndexConfig();
    const definition = config.definition as
      | {
          mappings?: {
            fields?: {
              embedding?: {
                dimensions?: number;
              };
            };
          };
        }
      | undefined;

    return {
      name:
        typeof config.name === "string" ? config.name : "resume_vector_index",
      dimensions:
        typeof definition?.mappings?.fields?.embedding?.dimensions === "number"
          ? definition.mappings.fields.embedding.dimensions
          : Number(env.embeddingDim || 1024),
      similarity: "cosine",
    };
  }

  private toCandidate(
    document: Record<string, unknown>,
    index: number,
  ): SearchCandidate {
    const id =
      typeof document.resumeId === "string" &&
      document.resumeId.trim().length > 0
        ? document.resumeId
        : String(document._id ?? `vector-${index + 1}`);

    const name = typeof document.name === "string" ? document.name : "";
    const company =
      typeof document.company === "string" ? document.company : "";
    const role = typeof document.role === "string" ? document.role : "";
    const skills = Array.isArray(document.skills)
      ? document.skills.filter(
          (skill): skill is string => typeof skill === "string",
        )
      : typeof document.skills === "string"
        ? document.skills
            .split(/[,;\n]/)
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];
    const experienceYears = Number(
      document.totalExperience ??
        document.total_Experience ??
        document.relevantExperience ??
        document.relevant_Experience,
    );
    const snippet =
      [
        document.text,
        document.name,
        document.company,
        document.role,
        document.summary,
        document.snippet,
      ]
        .filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        )
        .join(" ")
        .trim() || [name, company, role].filter(Boolean).join(" ").trim();

    const rawScore = Number((document as { _score?: number })._score ?? 0);
    const normalizedScore = Number.isFinite(rawScore)
      ? Number(rawScore.toFixed(3))
      : 0;

    return {
      resumeId: id,
      name,
      company,
      role,
      location:
        typeof document.location === "string" ? document.location : undefined,
      skills,
      experienceYears: Number.isFinite(experienceYears)
        ? experienceYears
        : undefined,
      education: this.stringifyEducation(document.education),
      snippet,
      score: normalizedScore,
      source: "vector",
      matchType: "vector",
      rank: index + 1,
      bm25Score: undefined,
      vectorScore: normalizedScore,
      vectorRawScore: Number.isFinite(rawScore) ? rawScore : 0,
      hybridScore: undefined,
    };
  }

  private normalizeScores(candidates: SearchCandidate[]): SearchCandidate[] {
    if (candidates.length === 0) {
      return [];
    }

    return candidates.map((candidate) => {
      const rawScore = Number(
        candidate.vectorRawScore ??
          candidate.vectorScore ??
          candidate.score ??
          0,
      );
      const clampedScore = Math.max(0, Math.min(1, rawScore));

      return {
        ...candidate,
        score: Number(clampedScore.toFixed(3)),
        vectorScore: Number(clampedScore.toFixed(3)),
        vectorRawScore: Number.isFinite(rawScore) ? rawScore : 0,
        bm25Score: undefined,
        hybridScore: undefined,
      };
    });
  }

  private stringifyEducation(value: unknown): string | undefined {
    if (typeof value === "string") {
      return value.trim() || undefined;
    }
    if (Array.isArray(value)) {
      const entries = value
        .map((item) => this.stringifyEducation(item))
        .filter((item): item is string => Boolean(item));
      return entries.length > 0 ? entries.join(", ") : undefined;
    }
    if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value)
        .map(([key, item]) => {
          const formatted = this.stringifyEducation(item);
          return formatted ? `${key}: ${formatted}` : undefined;
        })
        .filter((item): item is string => Boolean(item));
      return entries.length > 0 ? entries.join(", ") : undefined;
    }
    return undefined;
  }
}
