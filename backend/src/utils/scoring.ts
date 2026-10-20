export function normalizeScores(scores: number[]): number[] {
  if (scores.length === 0) {
    return [];
  }

  // BM25 and cosine similarity are on different scales, so raw fusion
  // without normalization can bias the final ranking toward one branch.
  const min = Math.min(...scores);
  const max = Math.max(...scores);

  if (max === min) {
    return new Array(scores.length).fill(max > 0 ? 1 : 0);
  }

  return scores.map((score) => Number(((score - min) / (max - min)).toFixed(6)));
}
