import test from 'node:test';
import assert from 'node:assert/strict';
import { Bm25SearchService } from './bm25SearchService';
import { ResumeRepository } from '../../repositories/resumeRepository';

test('bm25 search preserves Atlas search scores from repository results', async () => {
  const repository = {
    searchAtlasBm25: async () => [{
      _id: 'atlas-1',
      text: 'Python backend engineer',
      name: 'Ada Lovelace',
      company: 'Acme',
      role: 'Backend Engineer',
      skills: ['Python', 'MongoDB'],
      score: 12.5,
    }],
    getSearchDocuments: async () => [],
  } as unknown as ResumeRepository;

  const service = new Bm25SearchService(repository);
  const results = await service.search('python', {}, 3);

  assert.equal(results.length, 1);
  assert.equal(results[0].score, 12.5);
});
