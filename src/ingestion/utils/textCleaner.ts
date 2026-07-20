export const cleanResumeText = (rawText: string): string => rawText
  .replace(/\r/g, '\n')
  .replace(/[\u0000-\u001f]/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .replace(/[ \t]+/g, ' ')
  .replace(/[ \t]*\n[ \t]*/g, '\n')
  .trim();
