import { env } from '../config/environment';

export interface CandidateLike {
  resumeId?: string;
  snippet?: string;
  score?: number;
  name?: string;
  company?: string;
  role?: string;
  source?: 'bm25' | 'vector' | 'hybrid';
  matchType?: 'bm25' | 'vector' | 'hybrid';
  summary?: string;
  metadata?: Record<string, unknown>;
  bm25Score?: number;
  vectorScore?: number;
  hybridScore?: number;
}

export interface RerankResult {
  results: CandidateLike[];
  timings: { rerankMs: number };
  warnings: string[];
}

export interface MetadataExtractionResult {
  skills: string[];
  jobTitles: string[];
  experienceSummary: string;
}

export class LLMService {
  private readonly model = env.groqLlmModel || 'meta-llama/llama-4-scout-17b-16e-instruct';

  async rerankCandidates(query: string, candidates: CandidateLike[], topK = 10): Promise<RerankResult> {
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return { results: [], timings: { rerankMs: 0 }, warnings: ['No candidates were provided for reranking.'] };
    }

    const startedAt = Date.now();
    const normalizedQuery = this.normalize(query);
    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
    const warnings: string[] = [];

    const scored = candidates
      .map((candidate) => {
        const snippet = this.normalize(candidate.snippet ?? `${candidate.name ?? ''} ${candidate.company ?? ''} ${candidate.role ?? ''}`);
        const titleText = this.normalize(`${candidate.name ?? ''} ${candidate.role ?? ''}`);
        let score = typeof candidate.hybridScore === 'number'
          ? candidate.hybridScore
          : typeof candidate.score === 'number'
            ? candidate.score
            : 0;

        queryTerms.forEach((term) => {
          if (snippet.includes(term)) {
            score += 3;
          }
          if (titleText.includes(term)) {
            score += 2;
          }
        });

        const overlapCount = queryTerms.filter((term) => snippet.includes(term)).length;
        score += overlapCount * 1.5;

        return {
          ...candidate,
          score,
          hybridScore: typeof candidate.hybridScore === 'number' ? candidate.hybridScore : score,
        };
      })
      .sort((left, right) => right.score - left.score);

    if (scored.length > 0 && queryTerms.length === 0) {
      warnings.push('No meaningful query terms were supplied; reranking used the existing score order.');
    }

    return {
      results: scored.slice(0, topK),
      timings: { rerankMs: Date.now() - startedAt },
      warnings,
    };
  }

  async summarizeCandidateFit(query: string, candidate: CandidateLike, options?: { style?: 'short' | 'detailed'; maxTokens?: number }): Promise<string> {
    const style = options?.style === 'detailed' ? 'detailed' : 'short';
    const maxTokens = typeof options?.maxTokens === 'number' && Number.isFinite(options.maxTokens) ? options.maxTokens : 220;
    const snippet = this.normalize(candidate.snippet ?? `${candidate.name ?? ''} ${candidate.company ?? ''} ${candidate.role ?? ''}`);
    const preview = this.trimToTokenBudget(snippet, maxTokens);

    if (style === 'detailed') {
      return this.trimToTokenBudget(`Candidate ${candidate.name ?? candidate.resumeId ?? 'unknown'} appears to be a strong match for "${query}" because the profile highlights ${preview}.`, maxTokens);
    }

    return this.trimToTokenBudget(`Strong fit for "${query}": ${preview}`, maxTokens);
  }

  async generateAnswer(query: string, candidates: CandidateLike[], options?: { maxTokens?: number }): Promise<string> {
    if (!env.groqApiKey) {
      return this.buildFallbackAnswer(query, candidates);
    }

    const prompt = [
      'You are a helpful recruiting assistant.',
      'Answer the user query using the candidate context provided.',
      'Be concise and mention the strongest matches.',
      `Query: ${query}`,
      `Candidates:\n${candidates.slice(0, 5).map((candidate) => `- ${candidate.name ?? candidate.resumeId ?? 'candidate'}: ${candidate.snippet ?? candidate.role ?? ''}`).join('\n')}`,
    ].join('\n\n');

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for resume search.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: Math.max(80, options?.maxTokens ?? 220),
        }),
      });

      if (!response.ok) {
        return this.buildFallbackAnswer(query, candidates);
      }

      const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const answer = payload.choices?.[0]?.message?.content?.trim();
      return answer && answer.length > 0 ? answer : this.buildFallbackAnswer(query, candidates);
    } catch {
      return this.buildFallbackAnswer(query, candidates);
    }
  }

  extractMetadata(rawText: string): MetadataExtractionResult {
    const normalized = this.normalize(rawText);
    const skills = Array.from(
      new Set(
        [
          'node',
          'node.js',
          'mongodb',
          'express',
          'typescript',
          'javascript',
          'react',
          'python',
          'sql',
          'aws',
          'docker',
          'kubernetes',
          'java',
          'spring',
          'testing',
          'automation',
          'api',
          'microservices',
        ].filter((skill) => normalized.includes(skill)),
      ),
    );

    const jobTitles = Array.from(
      new Set(
        ['engineer', 'developer', 'architect', 'manager', 'analyst', 'qa', 'lead', 'consultant'].filter((title) => normalized.includes(title)),
      ),
    );

    return {
      skills,
      jobTitles,
      experienceSummary: normalized.length > 220 ? `${normalized.slice(0, 220)}...` : normalized,
    };
  }

  private buildFallbackAnswer(query: string, candidates: CandidateLike[]): string {
    const topCandidate = candidates[0];
    if (topCandidate) {
      return `I found ${candidates.length} candidate(s) relevant to "${query}". The strongest match is ${topCandidate.name ?? topCandidate.resumeId ?? 'the top result'}${topCandidate.role ? ` (${topCandidate.role})` : ''}.`;
    }

    return `I could not generate a live answer for "${query}" because no candidate context was available.`;
  }

  private normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private trimToTokenBudget(value: string, maxTokens: number): string {
    const normalizedMaxTokens = Number.isFinite(maxTokens) ? Math.max(20, Math.round(maxTokens)) : 220;
    const approxCharsPerToken = 4;
    const maxCharacters = Math.min(Math.max(40, normalizedMaxTokens * approxCharsPerToken), 120);

    if (value.length <= maxCharacters) {
      return value;
    }

    return `${value.slice(0, Math.max(0, maxCharacters - 3)).trimEnd()}...`;
  }
}
