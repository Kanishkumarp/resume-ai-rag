import test from 'node:test';
import assert from 'node:assert/strict';
import { getSearchEndpoint, normalizeResults } from '../../../frontend/app/src/lib/api/search.api';
import { VectorSearchService } from './search/vectorSearchService';
import { SearchService } from './searchService';

test('hybrid search returns BM25 and vector result sets with fallback metadata', async () => {
  const service = new SearchService();
  const result = await service.hybridSearch('node.js backend engineer', { minYearsExperience: 3 }, 3);

  assert.ok(Array.isArray(result.bm25Results), 'Expected BM25 results to be an array');
  assert.ok(Array.isArray(result.vectorResults), 'Expected vector results to be an array');
  assert.ok(Array.isArray(result.results), 'Expected merged hybrid results to be an array');
  assert.ok(Array.isArray(result.warnings), 'Expected warnings to be an array');
  assert.equal(result.source, 'hybrid');
  assert.equal(result.vectorFallback, false, 'Vector fallback should be disabled when both branches return results');
  assert.equal(result.bm25Fallback, false, 'BM25 fallback should be disabled when both branches return results');
  assert.equal(typeof result.timings.bm25Ms, 'number');
  assert.equal(typeof result.timings.vectorMs, 'number');
  assert.ok(result.bm25Results.length > 0 || result.vectorResults.length > 0, 'Expected at least one search result');
  assert.ok(result.results.every((candidate) => candidate.score >= 0 && candidate.score <= 1), 'Hybrid scores should be normalized to a comparable range');
});

test('hybrid merge normalizes each branch score before blending them', async () => {
  const service = new SearchService();
  const hybridService = (service as unknown as {
    hybridService: {
      mergeResults: (
        bm25Results: Array<{ resumeId: string; score: number; source: string; matchType: string; }>,
        vectorResults: Array<{ resumeId: string; score: number; source: string; matchType: string; }>,
      ) => Array<{ resumeId: string; score: number; bm25Score?: number; vectorScore?: number; hybridScore?: number }>;
    };
  }).hybridService;

  const merged = hybridService.mergeResults([
    { resumeId: 'candidate-1', score: 120, source: 'bm25', matchType: 'bm25' },
    { resumeId: 'candidate-2', score: 80, source: 'bm25', matchType: 'bm25' },
  ], [
    { resumeId: 'candidate-1', score: 0.95, source: 'vector', matchType: 'vector' },
    { resumeId: 'candidate-2', score: 0.45, source: 'vector', matchType: 'vector' },
  ]);

  const first = merged.find((candidate) => candidate.resumeId === 'candidate-1');
  assert.ok(first, 'Expected the first candidate to be present in the merged results');
  assert.equal(first.bm25Score, 1, 'Expected BM25 scores to be normalized against the branch maximum');
  assert.equal(first.vectorScore, 1, 'Expected vector scores to be normalized against the branch maximum');
  assert.equal(first.hybridScore, 1, 'Expected the hybrid score to be a balanced blend of the normalized component scores');
  assert.equal(first.score, first.hybridScore, 'Expected the visible score to be the hybrid score');
});

test('bm25 search returns structured candidate objects with expected fields', async () => {
  const service = new SearchService();
  const results = await service.bm25Search('node.js backend engineer', {}, 3);

  assert.ok(Array.isArray(results), 'Expected BM25 results to be an array');
  assert.ok(results.length > 0, 'Expected at least one BM25 result');

  const first = results[0];
  assert.equal(typeof first.resumeId, 'string');
  assert.equal(typeof first.name, 'string');
  assert.equal(typeof first.company, 'string');
  assert.equal(typeof first.role, 'string');
  assert.equal(typeof first.snippet, 'string');
  assert.equal(typeof first.score, 'number');
  assert.ok(first.score >= 0, 'Expected BM25 scores to be non-negative');
  assert.equal(first.score, Number(first.score.toFixed(3)), 'Expected BM25 scores to be rounded to three decimals');
  assert.equal(first.source, 'bm25');
  assert.equal(first.matchType, 'bm25');
  assert.equal(typeof first.rank, 'number');
});

test('bm25 search ranking changes when the query terms change', async () => {
  const service = new SearchService();
  const pythonResults = await service.bm25Search('python skills', {}, 3);
  const seleniumResults = await service.bm25Search('selenium automation', {}, 3);

  assert.ok(pythonResults.length > 0, 'Expected Python query to return results');
  assert.ok(seleniumResults.length > 0, 'Expected Selenium query to return results');
  assert.notEqual(pythonResults[0].resumeId, seleniumResults[0].resumeId, 'Expected different top-ranked resumes for different query terms');
});

test('normalizeResults preserves backend component scores for UI rendering', () => {
  const results = normalizeResults({
    results: [
      {
        id: 'candidate-1',
        name: 'Ada Lovelace',
        title: 'Senior Engineer',
        summary: 'Relevant candidate',
        bm25Score: 0.81,
        vectorScore: 0.95,
        hybridScore: 0.88,
      },
    ],
  });

  assert.equal(results[0]?.hybridScore, 0.88);
  assert.equal(results[0]?.bm25Score, 0.81);
  assert.equal(results[0]?.vectorScore, 0.95);
});

test('search endpoint mapping keeps BM25 and vector requests on their own routes', () => {
  assert.equal(getSearchEndpoint('bm25'), '/v1/search/bm25');
  assert.equal(getSearchEndpoint('vector'), '/v1/search/vector');
  assert.equal(getSearchEndpoint('hybrid'), '/v1/search/hybrid');
});

test('vector search preserves raw vector similarity scores and keeps them vector-only', async () => {
  const repository = {
    searchByEmbedding: async () => [{ _id: 'resume-1', name: 'Ada Lovelace', company: 'Acme', role: 'Engineer', text: 'backend engineer' }],
  } as unknown as {
    searchByEmbedding: (query: string, filters: Record<string, unknown>, topK: number) => Promise<Array<Record<string, unknown>>>;
  };

  const service = new VectorSearchService({
    searchByEmbedding: repository.searchByEmbedding,
  } as any);

  const results = await service.search('backend engineer', {}, 3);

  assert.ok(results.length > 0, 'Expected vector search to return results');
  assert.equal(results[0]?.score, 0.0, 'Expected vector search to preserve the raw similarity score without normalization');
  assert.equal(results[0]?.vectorScore, 0.0, 'Expected vector search to expose the same value through vectorScore');
  assert.equal(results[0]?.bm25Score, undefined, 'Expected pure vector search not to expose BM25 scores');
  assert.equal(results[0]?.hybridScore, undefined, 'Expected pure vector search not to expose hybrid scores');
});

test('bm25 and vector searches expose branch scores in the backend response', async () => {
  const service = new SearchService();

  const bm25Results = await service.bm25Search('node.js backend engineer', {}, 3);
  assert.ok(bm25Results.length > 0, 'Expected BM25 search to return results');
  assert.ok(typeof bm25Results[0]?.bm25Score === 'number', 'Expected BM25 results to expose bm25Score');
  assert.equal(bm25Results[0]?.score, bm25Results[0]?.bm25Score, 'Expected the visible score to match the BM25 branch score');

  const vectorResults = await service.vectorSearch('node.js backend engineer', {}, 3);
  assert.ok(vectorResults.length > 0, 'Expected vector search to return results');
  assert.ok(typeof vectorResults[0]?.vectorScore === 'number', 'Expected vector results to expose vectorScore');
  assert.equal(vectorResults[0]?.score, vectorResults[0]?.vectorScore, 'Expected the visible score to match the vector branch score');
});

test('mergeResults uses normalized weight ratios when blending branch scores', () => {
  const service = new SearchService();
  const hybridService = (service as unknown as {
    hybridService: {
      mergeResults: (
        bm25Results: Array<{ resumeId: string; score: number; source: string; matchType: string; }> ,
        vectorResults: Array<{ resumeId: string; score: number; source: string; matchType: string; }> ,
        weights?: { bm25?: number; vector?: number },
      ) => Array<{ resumeId: string; score: number; bm25Score?: number; vectorScore?: number; hybridScore?: number }>;
    };
  }).hybridService;

  const merged = hybridService.mergeResults(
    [{ resumeId: 'candidate-1', score: 1, source: 'bm25', matchType: 'bm25' }],
    [{ resumeId: 'candidate-1', score: 0, source: 'vector', matchType: 'vector' }],
    { bm25: 0.3, vector: 0.7 },
  );

  assert.equal(merged[0]?.hybridScore, 0.3);
});

test('balanced hybrid merge uses the available branch score when the other branch is missing', () => {
  const service = new SearchService();
  const hybridService = (service as unknown as {
    hybridService: {
      mergeResults: (
        bm25Results: Array<{ resumeId: string; score: number; source: string; matchType: string; }>,
        vectorResults: Array<{ resumeId: string; score: number; source: string; matchType: string; }>,
        weights?: { bm25?: number; vector?: number },
      ) => Array<{ resumeId: string; score: number; bm25Score?: number; vectorScore?: number; hybridScore?: number }>;
    };
  }).hybridService;

  const merged = hybridService.mergeResults(
    [{ resumeId: 'candidate-1', score: 120, source: 'bm25', matchType: 'bm25' }],
    [],
    { bm25: 50, vector: 50 },
  );

  const first = merged[0];
  assert.ok(first, 'Expected the merged candidate to exist');
  assert.equal(first.hybridScore, 0.5);
  assert.equal(first.bm25Score, 1);
  assert.equal(first.vectorScore, 0);
});

test('pure BM25 mode excludes vector-only candidates and pure vector mode excludes BM25-only candidates', () => {
  const service = new SearchService();
  const hybridService = (service as unknown as {
    hybridService: {
      mergeResults: (
        bm25Results: Array<{ resumeId: string; score: number; source: string; matchType: string; }>,
        vectorResults: Array<{ resumeId: string; score: number; source: string; matchType: string; }>,
        weights?: { bm25?: number; vector?: number },
      ) => Array<{ resumeId: string; score: number; bm25Score?: number; vectorScore?: number; hybridScore?: number }>;
    };
  }).hybridService;

  const bm25Only = hybridService.mergeResults(
    [{ resumeId: 'bm25-only', score: 120, source: 'bm25', matchType: 'bm25' }],
    [{ resumeId: 'vector-only', score: 0.95, source: 'vector', matchType: 'vector' }],
    { bm25: 100, vector: 0 },
  );

  assert.equal(bm25Only.length, 1);
  assert.equal(bm25Only[0]?.resumeId, 'bm25-only');
  assert.equal(bm25Only[0]?.hybridScore, 1);

  const vectorOnly = hybridService.mergeResults(
    [{ resumeId: 'bm25-only', score: 120, source: 'bm25', matchType: 'bm25' }],
    [{ resumeId: 'vector-only', score: 0.95, source: 'vector', matchType: 'vector' }],
    { bm25: 0, vector: 100 },
  );

  assert.equal(vectorOnly.length, 1);
  assert.equal(vectorOnly[0]?.resumeId, 'vector-only');
  assert.equal(vectorOnly[0]?.hybridScore, 1);
});
