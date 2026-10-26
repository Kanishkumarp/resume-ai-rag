import test from 'node:test';
import assert from 'node:assert/strict';
import { ResumeIngestionService } from './resumeIngestionService';

test('ingestResume parses and stores a resume without external dependencies', async () => {
  const service = new ResumeIngestionService();
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
});

test('cleanText and detectSkills provide the expected resume preprocessing results', () => {
  const service = new ResumeIngestionService();
  const cleaned = service.cleanText('  John Doe  \n\nSenior Engineer  ');
  const skills = service.detectSkills('Java, Selenium, Playwright, MongoDB');

  assert.equal(cleaned, 'John Doe\nSenior Engineer');
  assert.deepEqual(skills, ['Java', 'Selenium', 'Playwright', 'MongoDB']);
});
