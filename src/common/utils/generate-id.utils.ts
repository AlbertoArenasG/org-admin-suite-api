import { randomBytes } from 'crypto';

const ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const DEFAULT_LENGTH = 24;

/**
 * Generates a pseudo-random string identifier using a URL-friendly alphabet.
 * It mimics the length and distribution of NanoID without depending on the ESM-only package.
 */
export function genId(length = DEFAULT_LENGTH): string {
  const bytes = randomBytes(length);
  let id = '';

  for (let i = 0; i < length; i += 1) {
    const index = bytes[i] % ALPHABET.length;
    id += ALPHABET[index];
  }

  return id;
}
