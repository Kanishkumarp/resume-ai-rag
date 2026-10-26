import test from 'node:test';
import assert from 'node:assert/strict';
import { ResumeIngestionService } from './resumeIngestionService';
import type { ResumeIngestionDocument } from '../types';
import { createResumeContentHash } from '../utils/resumeContentHash';
import { cleanResumeText } from '../utils/textCleaner';
import { createResumeProfileHashes } from '../utils/resumeProfileHashes';

test('ingestResume stores searchable text without inventing embeddings when Mistral is unavailable', async () => {
  let storedDocument: ResumeIngestionDocument | undefined;
  const service = new ResumeIngestionService(
    undefined,
    { generateEmbedding: async () => { throw new Error('Mistral unavailable'); } },
    {
      findByContentHash: async () => null,
      save: async (document) => {
        storedDocument = document;
        return { id: 'resume-id', duplicate: false };
      },
    },
  );
  const result = await service.ingestResume({
    fileName: 'resume.pdf',
    rawText: [
      'John Doe',
      'Senior Backend Engineer',
      'john.doe@example.com',
      '+91 7000000000',
      'Bengaluru',
      'TCS',
      'Worked on Java, Node.js, MongoDB, and TypeScript for 3 years.',
    ].join('\n'),
  });

  assert.ok(result.id, 'Expected the ingestion service to return a document id');
  assert.equal(result.parsed.name, 'John Doe');
  assert.equal(result.parsed.email, 'john.doe@example.com');
  assert.equal(result.parsed.phone, '+91 7000000000');
  assert.equal(result.parsed.location, 'Bengaluru');
  assert.equal(result.parsed.company, 'TCS');
  assert.equal(result.parsed.role, 'Senior Backend Engineer');
  assert.ok(result.parsed.skills.includes('Java'));
  assert.ok(result.parsed.skills.includes('MongoDB'));
  assert.equal(storedDocument?.text.includes('Senior Backend Engineer'), true);
  assert.equal(storedDocument?.rawText.startsWith('John Doe'), true);
  assert.equal(storedDocument?.embedding, undefined);
  assert.match(result.warnings[0] ?? '', /keyword search only/);
});

test('ingestResume fails when the resume cannot be persisted', async () => {
  const service = new ResumeIngestionService(
    undefined,
    {
      generateEmbedding: async () => ({
        embedding: [0.1, 0.2],
        model: 'test-model',
        dimensions: 2,
      }),
    },
    {
      findByContentHash: async () => null,
      save: async () => { throw new Error('database unavailable'); },
    },
  );

  await assert.rejects(
    service.ingestResume({ fileName: 'resume.pdf', rawText: 'Candidate resume text' }),
    /database unavailable/,
  );
});

test('ingestResume versions a real embedding before storing it', async () => {
  let storedDocument: ResumeIngestionDocument | undefined;
  const service = new ResumeIngestionService(
    undefined,
    {
      generateEmbedding: async () => ({
        embedding: [0.25, 0.75],
        model: 'mistral-embed',
        dimensions: 2,
      }),
    },
    {
      findByContentHash: async () => null,
      save: async (document) => {
        storedDocument = document;
        return { id: 'resume-id', duplicate: false };
      },
    },
  );

  const result = await service.ingestResume({
    fileName: 'resume.pdf',
    rawText: 'Senior engineer with React experience',
  });

  assert.equal(result.warnings.length, 0);
  assert.deepEqual(storedDocument?.embedding, [0.25, 0.75]);
  assert.equal(storedDocument?.embeddingVersion, 1);
  assert.match(storedDocument?.contentHash ?? '', /^[a-f0-9]{64}$/);
});

test('ingestResume reuses an existing exact-content record before embedding', async () => {
  let embeddingCalls = 0;
  let saveCalls = 0;
  const service = new ResumeIngestionService(
    undefined,
    {
      generateEmbedding: async () => {
        embeddingCalls += 1;
        return { embedding: [0.1], model: 'test-model', dimensions: 1 };
      },
    },
    {
      findByContentHash: async (_contentHash, profileHashes) => {
        assert.ok(profileHashes.length > 0);
        return 'existing-resume-id';
      },
      save: async () => {
        saveCalls += 1;
        return { id: 'unexpected-id', duplicate: false };
      },
    },
  );

  const result = await service.ingestResume({
    fileName: 'renamed-copy.pdf',
    rawText: '  Senior Engineer  \n\nReact and TypeScript ',
  });

  test('profile identity hashes normalize email and phone but do not use name alone', () => {
    const first = createResumeProfileHashes(' Ada@Example.com ', '+1 (415) 555-0198');
    const second = createResumeProfileHashes('ada@example.com', '14155550198');

    assert.deepEqual(first, second);
    assert.deepEqual(createResumeProfileHashes('', '', 'Ada Lovelace'), []);
    assert.deepEqual(
      createResumeProfileHashes('', '', 'Ada Lovelace', 'Engineer', 'Analytical Engines'),
      createResumeProfileHashes('', '', '  ADA LOVELACE ', ' engineer ', 'analytical engines'),
    );
  });

  assert.equal(result.id, 'existing-resume-id');
  assert.equal(result.duplicate, true);
  assert.equal(embeddingCalls, 0);
  assert.equal(saveCalls, 0);
  assert.match(result.warnings[0] ?? '', /existing record was reused/i);
});

test('cleanText and detectSkills provide the expected resume preprocessing results', () => {
  const service = new ResumeIngestionService();
  const cleaned = service.cleanText('  John Doe  \n\nSenior Engineer  ');
  const skills = service.detectSkills('Java, Selenium, Playwright, MongoDB');

  assert.equal(cleaned, 'John Doe\nSenior Engineer');
  assert.deepEqual(skills, ['Java', 'Selenium', 'Playwright', 'MongoDB']);
});

test('resume content hashes ignore line wrapping and Unicode compatibility differences', () => {
  const first = cleanResumeText('Senior Engineer\nReact and TypeScript');
  const second = cleanResumeText('ＳＥＮＩＯＲ   ＥＮＧＩＮＥＥＲ React and TypeScript');

  assert.equal(createResumeContentHash(first), createResumeContentHash(second));
});
