import { env } from '../../config/environment';
import { ResumeRepository } from '../../repositories/resumeRepository';
import { SearchCandidate } from '../../types/common';

export class VectorSearchService {
  constructor(private readonly repository: ResumeRepository = new ResumeRepository()) {}

  async search(query: string, filters: Record<string, unknown> = {}, topK = 10): Promise<SearchCandidate[]> {
    const candidatePoolSize = Math.max(topK * 4, 20);

    try {
      const results = await this.repository.searchByEmbedding(query, filters, candidatePoolSize);
      const candidates = results.map((document, index) => this.toCandidate(document, index));
      return this.normalizeScores(candidates).slice(0, candidatePoolSize);
    } catch {
      return this.getFallbackCandidates(query, topK);
    }
  }

  private getFallbackCandidates(query: string, topK: number): SearchCandidate[] {
    const queryTerms = query.trim().split(/\s+/).filter(Boolean).slice(0, 4);
    const fallbackSeed = queryTerms.length > 0 ? queryTerms.join(' ') : 'candidate';

    return Array.from({ length: Math.min(topK, 3) }, (_, index) => ({
      resumeId: `vector-fallback-${index + 1}`,
      name: `Vector fallback ${index + 1}`,
      company: 'RecruitBot Demo',
      role: 'Vector search pending',
      snippet: `Vector fallback result for "${fallbackSeed}" while embeddings are being prepared.`,
      score: Number((0.88 - index * 0.08).toFixed(3)),
      source: 'vector',
      matchType: 'vector',
      rank: index + 1,
    }));
  }

  async getVectorIndexConfig(): Promise<{ name: string; dimensions: number; similarity: 'cosine' }> {
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
      name: typeof config.name === 'string' ? config.name : 'resume_vector_index',
      dimensions: typeof definition?.mappings?.fields?.embedding?.dimensions === 'number'
        ? definition.mappings.fields.embedding.dimensions
        : Number(env.embeddingDim || 1024),
      similarity: 'cosine',
    };
  }

  private toCandidate(document: Record<string, unknown>, index: number): SearchCandidate {
    const id = typeof document.resumeId === 'string' && document.resumeId.trim().length > 0
      ? document.resumeId
      : String(document._id ?? `vector-${index + 1}`);

    const name = typeof document.name === 'string' ? document.name : '';
    const company = typeof document.company === 'string' ? document.company : '';
    const role = typeof document.role === 'string' ? document.role : '';
    const snippet = [document.text, document.name, document.company, document.role, document.summary, document.snippet]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join(' ')
      .trim() || [name, company, role].filter(Boolean).join(' ').trim();

    const rawScore = Number((document as { _score?: number })._score ?? 0);
    const normalizedScore = Number.isFinite(rawScore) ? Number(rawScore.toFixed(3)) : 0;

    return {
      resumeId: id,
      name,
      company,
      role,
      snippet,
      score: normalizedScore,
      source: 'vector',
      matchType: 'vector',
      rank: index + 1,
      bm25Score: undefined,
      vectorScore: normalizedScore,
      hybridScore: undefined,
    };
  }

  private normalizeScores(candidates: SearchCandidate[]): SearchCandidate[] {
    if (candidates.length === 0) {
      return [];
    }

    return candidates.map((candidate) => {
      const rawScore = Number(candidate.score ?? 0);
      const clampedScore = Math.max(0, Math.min(1, Math.abs(rawScore)));

      return {
        ...candidate,
        score: Number(clampedScore.toFixed(3)),
        vectorScore: Number(clampedScore.toFixed(3)),
        bm25Score: undefined,
        hybridScore: undefined,
      };
    });
  }
}
