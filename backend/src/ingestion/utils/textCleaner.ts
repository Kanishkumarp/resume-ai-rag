export const cleanResumeText = (rawText: string): string => rawText
  .replace(/\r/g, '\n')
  .replace(/[\u0000-\u0008\u000b-\u001f]/g, ' ')
  .replace(/\n{2,}/g, '\n')
  .replace(/[ \t]+/g, ' ')
  .replace(/[ \t]*\n[ \t]*/g, '\n')
  .trim();
