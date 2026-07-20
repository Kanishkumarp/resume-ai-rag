import type { SearchMode, SearchResult } from '../../types/search.types';

export interface ScoreDisplayMeta {
  label: string;
  value: number;
}

export interface ScoreBreakdown {
  primaryLabel: string;
  primaryValue: number;
  hybrid?: number;
  bm25?: number;
  vector?: number;
}

function normalizeScore(value: number | undefined | null): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  return Number(value.toFixed(3));
}

export function getScoreDisplayMeta(result: Pick<SearchResult, 'score' | 'bm25Score' | 'vectorScore' | 'hybridScore'>, mode?: SearchMode): ScoreDisplayMeta {
  const fallbackScore = normalizeScore(result.score);
  const bm25Score = normalizeScore(result.bm25Score);
  const vectorScore = normalizeScore(result.vectorScore);
  const hybridScore = normalizeScore(result.hybridScore);

  if (mode === 'bm25') {
    return { label: 'BM25', value: bm25Score ?? fallbackScore ?? 0 };
  }

  if (mode === 'vector') {
    return { label: 'Vector', value: vectorScore ?? fallbackScore ?? 0 };
  }

  if (hybridScore !== undefined) {
    return { label: 'Hybrid', value: hybridScore };
  }

  if (vectorScore !== undefined) {
    return { label: 'Vector', value: vectorScore };
  }

  if (bm25Score !== undefined) {
    return { label: 'BM25', value: bm25Score };
  }

  return { label: 'Score', value: fallbackScore ?? 0 };
}

export function getScoreBreakdown(result: Pick<SearchResult, 'score' | 'bm25Score' | 'vectorScore' | 'hybridScore'>, mode?: SearchMode): ScoreBreakdown {
  const meta = getScoreDisplayMeta(result, mode);
  return {
    primaryLabel: meta.label,
    primaryValue: meta.value,
    hybrid: normalizeScore(result.hybridScore),
    bm25: normalizeScore(result.bm25Score),
    vector: normalizeScore(result.vectorScore),
  };
}
