const ACCENT_EQUIVALENTS: Record<string, string> = {
  a: 'aáàäâãåāăą',
  c: 'cçćĉċč',
  d: 'dďđ',
  e: 'eéèëêēĕėęě',
  g: 'gĝğġģ',
  h: 'hĥħ',
  i: 'iíìïîĩīĭįı',
  j: 'jĵ',
  k: 'kķ',
  l: 'lĺļľł',
  n: 'nñńņňŋ',
  o: 'oóòöôõøōŏő',
  r: 'rŕŗř',
  s: 'sśŝşš',
  t: 'tţťŧ',
  u: 'uúùüûũūŭůűų',
  w: 'wŵ',
  y: 'yýÿŷ',
  z: 'zźżž',
};

const COMBINING_DIACRITICS = /[\u0300-\u036f]/g;
const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

export function buildAccentInsensitiveRegex(value: string): string {
  const normalized = value.normalize('NFD').replace(COMBINING_DIACRITICS, '');

  return Array.from(normalized)
    .map((character) => {
      const equivalents = ACCENT_EQUIVALENTS[character.toLowerCase()];
      return equivalents ? `[${equivalents}]` : escapeRegex(character);
    })
    .join('');
}

function escapeRegex(value: string): string {
  return value.replace(REGEX_SPECIAL_CHARACTERS, '\\$&');
}
