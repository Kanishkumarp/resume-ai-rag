import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCandidateProfileFromSearchResult } from './candidate.api';
import { extractCandidateMetadata } from './search.api';
import { normalizeCandidate } from './searchResultNormalizer';

test('buildCandidateProfileFromSearchResult maps search results into a richer profile view', () => {
  const candidate = buildCandidateProfileFromSearchResult('candidate-123', {
    name: 'Asha Patel',
    title: 'Senior Backend Engineer',
    summary: 'Builds resilient APIs and event-driven services.',
    skills: ['Node.js', 'TypeScript', 'MongoDB'],
    location: 'Remote • US',
    score: 0.93,
    experienceYears: 7,
    source: 'hybrid',
  });

  assert.equal(candidate.id, 'candidate-123');
  assert.equal(candidate.name, 'Asha Patel');
  assert.equal(candidate.title, 'Senior Backend Engineer');
  assert.equal(candidate.summary, 'Builds resilient APIs and event-driven services.');
  assert.deepEqual(candidate.skills, ['Node.js', 'TypeScript', 'MongoDB']);
  assert.equal(candidate.location, 'Remote • US');
  assert.equal(candidate.matchScore, 0.93);
  assert.equal(candidate.source, 'hybrid');
  assert.equal(candidate.experienceYears, 7);
});

test('extractCandidateMetadata pulls email, phone, and skills from resume text', () => {
  const metadata = extractCandidateMetadata({
    summary: 'Contact: candidate@example.invalid · +1 555-0100 · Chennai, Tamil Nadu. Skilled in Python, Node.js, MongoDB, LangChain, and REST APIs.',
  });

  assert.equal(metadata.email, 'candidate@example.invalid');
  assert.equal(metadata.phone, '+1 555-0100');
  assert.deepEqual(metadata.skills, ['Python', 'Node.js', 'MongoDB', 'LangChain', 'REST APIs']);
  assert.equal(metadata.location, 'Chennai, Tamil Nadu');
});

test('candidate profiles do not invent missing resume details', () => {
  const candidate = buildCandidateProfileFromSearchResult('candidate-456', { name: 'Asha Patel' });

  assert.deepEqual(candidate.skills, []);
  assert.equal(candidate.location, undefined);
  assert.equal(candidate.experienceYears, undefined);
  assert.equal(candidate.summary, undefined);
  assert.equal(candidate.experience, undefined);
});

test('search results retain the resume text and require a stable candidate ID', () => {
  const result = normalizeCandidate({
    _id: 'candidate-789',
    text: 'Backend engineer resume content',
    phoneNumber: '+1 555 010 0000',
  });

  assert.equal(result.id, 'candidate-789');
  assert.equal(result.summary, 'Backend engineer resume content');
  assert.equal(result.phone, '+1 555 010 0000');
  assert.throws(() => normalizeCandidate({ name: 'No ID' }), /missing a candidate ID/);
});
