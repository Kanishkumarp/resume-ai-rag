import { ResumeRepository } from '../../repositories/resumeRepository';
import { SearchCandidate } from '../../types/common';

export class Bm25SearchService {
  private readonly BM25_SEARCH_PATHS = ['text', 'skills', 'name'];

  constructor(private readonly repository: ResumeRepository = new ResumeRepository()) {}

  async search(query: string, filters: Record<string, unknown> = {}, topK = 10): Promise<SearchCandidate[]> {
    const candidatePoolSize = Math.max(topK * 4, 20);

    try {
      const atlasDocuments = await this.repository.searchAtlasBm25(query, filters, candidatePoolSize);
      if (atlasDocuments.length > 0) {
        return atlasDocuments
          .map((document, index) => this.toCandidate(document, index))
          .slice(0, candidatePoolSize);
      }
    } catch {
      // Fall back to local ranking when Atlas search is unavailable.
    }

    const documents = await this.repository.getSearchDocuments(filters);
    if (documents.length === 0) {
      return this.getFallbackCandidates(query, topK);
    }

    const queryTokens = this.tokenize(query);
    const averageDocumentLength = documents.reduce((sum, document) => sum + this.getTokenCount(document.text), 0) / documents.length;
    const k1 = 1.5;
    const b = 0.75;

    const scoredDocuments = documents
      .map((document) => {
        const score = this.scoreBm25Document(document, queryTokens, documents, averageDocumentLength, k1, b);
        const searchableText = this.stringifyValue([
          document.text,
          document.name,
          document.company,
          document.role,
          document.skills,
        ]);
        const searchableTitle = this.stringifyValue([document.name, document.role, document.company]);
        const searchableSkills = this.stringifyValue(document.skills);
        const matchedTerms = queryTokens.filter((token) => this.tokenize(searchableText).includes(token)).length;
        const titleMatches = queryTokens.filter((token) => this.tokenize(searchableTitle).includes(token)).length;
        const skillMatches = queryTokens.filter((token) => this.tokenize(searchableSkills).includes(token)).length;
        const queryTermBoost = matchedTerms * 0.9 + titleMatches * 0.5 + skillMatches * 0.6;
        return { ...document, _score: Number((score + queryTermBoost).toFixed(3)) } as Record<string, unknown> & { _score: number };
      })
      .sort((left, right) => (right as { _score: number })._score - (left as { _score: number })._score)
      .slice(0, topK);

    return scoredDocuments.map((document, index) => this.toCandidate(document, index));
  }

  private getFallbackCandidates(query: string, topK: number): SearchCandidate[] {
    const queryTerms = this.tokenize(query).slice(0, 4);
    const fallbackSeed = queryTerms.length > 0 ? queryTerms.join(' ') : 'candidate';

    return Array.from({ length: Math.min(topK, 3) }, (_, index) => ({
      resumeId: `fallback-${index + 1}`,
      name: `Fallback ${index + 1} Candidate`,
      company: 'RecruitBot Demo',
      role: 'Role match pending',
      snippet: `Fallback result for "${fallbackSeed}" while the search backend is warming up.`,
      score: Number((0.9 - index * 0.1).toFixed(3)),
      source: 'bm25',
      matchType: 'bm25',
      rank: index + 1,
    }));
  }

  private tokenize(value: string): string[] {
    return value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  }

  private stringifyValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.join(' ');
    }
    return '';
  }

  private getTokenCount(value: unknown): number {
    if (typeof value !== 'string') {
      return 0;
    }
    return this.tokenize(value).length;
  }

  private scoreBm25Document(document: Record<string, unknown>, queryTokens: string[], documents: Record<string, unknown>[], averageDocumentLength: number, k1: number, b: number): number {
    const text = typeof document.text === 'string' ? document.text : '';
    const documentTokens = this.tokenize(text);
    const documentLength = documentTokens.length || 1;

    const skillTokens = this.tokenize(Array.isArray(document.skills) ? document.skills.join(' ') : typeof document.skills === 'string' ? document.skills : '');
    const textFields = [
      text,
      typeof document.name === 'string' ? document.name : '',
      typeof document.company === 'string' ? document.company : '',
      typeof document.role === 'string' ? document.role : '',
      Array.isArray(document.skills) ? document.skills.join(' ') : typeof document.skills === 'string' ? document.skills : '',
    ].join(' ');

    let score = 0;

    queryTokens.forEach((token) => {
      const documentFrequency = documents.reduce((count, candidateDocument) => {
        const candidateText = typeof candidateDocument.text === 'string' ? candidateDocument.text : '';
        const candidateTokens = this.tokenize(candidateText);
        return count + (candidateTokens.includes(token) ? 1 : 0);
      }, 0);

      const termFrequency = documentTokens.filter((candidateToken) => candidateToken === token).length;
      const skillFrequency = skillTokens.filter((candidateToken) => candidateToken === token).length;
      const effectiveTermFrequency = termFrequency + skillFrequency;

      if (effectiveTermFrequency === 0) {
        return;
      }

      const idf = Math.log((documents.length - documentFrequency + 0.5) / (documentFrequency + 0.5) + 1);
      const numerator = effectiveTermFrequency * (k1 + 1);
      const denominator = effectiveTermFrequency + k1 * (1 - b + b * (documentLength / (averageDocumentLength || 1)));
      score += idf * (numerator / denominator);
    });

    if (queryTokens.length > 0) {
      const fieldMatches = queryTokens.filter((token) => this.tokenize(textFields).includes(token)).length;
      score += fieldMatches * 0.7;
    }

    return Number(score.toFixed(3));
  }

  private toCandidate(document: Record<string, unknown>, index: number): SearchCandidate {
    const id = typeof document.resumeId === 'string' && document.resumeId.trim().length > 0
      ? document.resumeId
      : String(document._id ?? `bm25-${index + 1}`);

    const name = typeof document.name === 'string' ? document.name : '';
    const company = typeof document.company === 'string' ? document.company : '';
    const role = typeof document.role === 'string' ? document.role : '';
    const snippet = [document.text, document.name, document.company, document.role, document.summary, document.snippet]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join(' ')
      .trim() || [name, company, role].filter(Boolean).join(' ').trim();

    const rawScore = Number((document as { score?: number }).score ?? (document as { _score?: number })._score ?? 0);
    const normalizedScore = Number.isFinite(rawScore) ? Number(rawScore.toFixed(3)) : 0;

    return {
      resumeId: id,
      name,
      company,
      role,
      snippet,
      score: normalizedScore,
      source: 'bm25',
      matchType: 'bm25',
      rank: index + 1,
      bm25Score: normalizedScore,
      vectorScore: undefined,
    };
  }
}
