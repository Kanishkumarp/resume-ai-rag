import test from 'node:test';
import assert from 'node:assert/strict';
import { LLMService } from './llmService';

test('rerankCandidates orders candidates by relevance using the query terms', async () => {
  const service = new LLMService();
  const ranked = await service.rerankCandidates('node.js backend engineer', [
    { resumeId: '1', snippet: 'Frontend React developer' },
    { resumeId: '2', snippet: 'Node.js backend engineer with MongoDB experience' },
  ], 3);

  assert.equal(ranked.results[0].resumeId, '2');
  assert.equal(ranked.results[1].resumeId, '1');
});

test('summarizeCandidateFit respects the configured max token budget', async () => {
  const service = new LLMService();
  const summary = await service.summarizeCandidateFit('node backend engineer', {
    resumeId: '1',
    snippet: 'A very experienced backend engineer with deep expertise in Node.js, TypeScript, MongoDB, and distributed systems for enterprise products',
  }, { style: 'short', maxTokens: 40 });

  assert.ok(summary.length <= 120, 'Expected the summary to be trimmed to the configured size budget');
  assert.ok(summary.includes('Strong fit') || summary.includes('Candidate'), 'Expected the summary to include a clear fit rationale');
});

test('generateAnswer falls back to a deterministic response when no Groq key is configured', async () => {
  const service = new LLMService();
  const answer = await service.generateAnswer('backend engineer', [{ resumeId: '1', name: 'Ada', role: 'Backend Engineer', snippet: 'Node.js and MongoDB experience' }]);

  assert.ok(answer.includes('backend engineer') || answer.includes('Ada') || answer.includes('candidate'), 'Expected the answer to mention the query or strongest candidate');
});
