import { createHash } from 'node:crypto';

export const createResumeContentHash = (text: string): string =>
  createHash('sha256')
    .update(
      text
        .normalize('NFKC')
        .toLocaleLowerCase('en')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .digest('hex');
