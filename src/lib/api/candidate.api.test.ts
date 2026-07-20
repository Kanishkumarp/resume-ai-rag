import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCandidateProfileFromSearchResult } from './candidate.api';
import { extractCandidateMetadata } from './search.api';

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
    summary: 'Contact: kanishkumar940@gmail.com · +91 9940205575 · Chennai, Tamil Nadu. Skilled in Python, Node.js, MongoDB, LangChain, and REST APIs.',
  });

  assert.equal(metadata.email, 'kanishkumar940@gmail.com');
  assert.equal(metadata.phone, '+91 9940205575');
  assert.deepEqual(metadata.skills, ['Python', 'Node.js', 'MongoDB', 'LangChain', 'REST APIs']);
  assert.equal(metadata.location, 'Chennai, Tamil Nadu');
});
