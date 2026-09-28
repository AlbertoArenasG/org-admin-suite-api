/**
 * Restores UTF-8 filenames parsed as Latin-1 by multipart parsers.
 *
 * Busboy defaults `filename` parameters to Latin-1 even though browsers send
 * them as UTF-8. Only convert when the byte round trip proves it is lossless.
 */
export function normalizeMultipartFilename(filename: string): string {
  if (
    !Array.from(filename).every(
      (character) => character.codePointAt(0)! <= 0xff,
    )
  ) {
    return filename;
  }

  const source = Buffer.from(filename, 'latin1');
  const decoded = source.toString('utf8');

  if (decoded.includes('\ufffd')) {
    return filename;
  }

  return Buffer.from(decoded, 'utf8').equals(source) ? decoded : filename;
}
