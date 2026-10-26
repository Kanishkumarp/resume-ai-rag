import test from 'node:test';
import assert from 'node:assert/strict';
import { ResumeParserService } from './resumeParserService';

test('parseResume extracts common resume fields from plain text', () => {
  const parser = new ResumeParserService();
  const sample = `
  Example Candidate
  QA Engineer
  candidate@example.invalid
  +91 7000000000
  Chennai, Tamil Nadu
  TCS
  B.E Computer Science
  3.3 years
  Skills: Java Selenium Playwright
  `;

  const result = parser.parseResume(sample);

  assert.equal(result.name, 'Example Candidate');
  assert.equal(result.email, 'candidate@example.invalid');
  assert.equal(result.phone, '+91 7000000000');
  assert.equal(result.location, 'Chennai');
  assert.deepEqual(result.skills, ['Java', 'Selenium', 'Playwright']);
  assert.equal(result.company, 'TCS');
  assert.equal(result.role, 'QA Engineer');
  assert.equal(result.education, 'B.E Computer Science');
  assert.equal(result.totalExperience, 3.3);
});
