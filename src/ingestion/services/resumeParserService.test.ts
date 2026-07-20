import test from 'node:test';
import assert from 'node:assert/strict';
import { ResumeParserService } from './resumeParserService';

test('parseResume extracts common resume fields from plain text', () => {
  const parser = new ResumeParserService();
  const sample = `
  ASHWIN P
  QA Engineer
  ashwin@gmail.com
  +91 9876543210
  Chennai, India
  TCS
  B.E Computer Science
  3.3 years
  Skills: Java Selenium Playwright
  `;

  const result = parser.parseResume(sample);

  assert.equal(result.name, 'ASHWIN P');
  assert.equal(result.email, 'ashwin@gmail.com');
  assert.equal(result.phone, '+91 9876543210');
  assert.equal(result.location, 'Chennai');
  assert.deepEqual(result.skills, ['Java', 'Selenium', 'Playwright']);
  assert.equal(result.company, 'TCS');
  assert.equal(result.role, 'QA Engineer');
  assert.equal(result.education, 'B.E Computer Science');
  assert.equal(result.totalExperience, 3.3);
});
