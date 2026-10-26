import { createHash } from 'node:crypto';

const hashIdentity = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

export const createResumeProfileHashes = (
  email: unknown,
  phone: unknown,
  name?: unknown,
  role?: unknown,
  company?: unknown,
): string[] => {
  const hashes: string[] = [];
  if (typeof email === 'string' && email.trim()) {
    hashes.push(hashIdentity(`email:${email.normalize('NFKC').trim().toLowerCase()}`));
  }
  if (typeof phone === 'string') {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 8) {
      hashes.push(hashIdentity(`phone:${digits}`));
    }
  }
  if (hashes.length === 0 && typeof name === 'string' && name.trim()) {
    const profile = [name, role, company]
      .map((value) =>
        typeof value === 'string'
          ? value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ')
          : '',
      );
    if (profile[1] || profile[2]) {
      hashes.push(hashIdentity(`profile:${profile.join('|')}`));
    }
  }
  return hashes;
};
