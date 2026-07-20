const raw = `
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
const cleaned = raw
  .replace(/\r/g, '\n')
  .replace(/[\u0000-\u001f]/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .replace(/[ \t]+/g, ' ')
  .replace(/[ \t]*\n[ \t]*/g, '\n')
  .trim();
console.log(JSON.stringify(cleaned));
console.log(cleaned.split(/\n+/));
