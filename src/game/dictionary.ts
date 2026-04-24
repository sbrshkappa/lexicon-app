import { WORD_SET, WORD_COUNT } from '../data/wordlist';

/**
 * Returns true if `word` is a valid dictionary word (case-insensitive).
 * Also rejects 1-letter "words" per Lexicon rules (a played word needs >=2 letters).
 */
export function isValidWord(word: string): boolean {
  if (!word || word.length < 2) return false;
  if (!/^[A-Za-z]+$/.test(word)) return false;
  return WORD_SET.has(word.toUpperCase());
}

export function dictionarySize(): number {
  return WORD_COUNT;
}

/**
 * Utility — find words in the dictionary that contain the given letters (as
 * multiset). Not used by core play but handy for hints / future AI.
 */
export function wordsUsingLetters(letters: string[]): string[] {
  const available: Record<string, number> = {};
  letters.forEach((l) => {
    const k = l.toUpperCase();
    available[k] = (available[k] ?? 0) + 1;
  });
  const out: string[] = [];
  WORD_SET.forEach((w) => {
    const need: Record<string, number> = {};
    for (const ch of w) need[ch] = (need[ch] ?? 0) + 1;
    let ok = true;
    for (const k in need) {
      if ((available[k] ?? 0) < need[k]) {
        ok = false;
        break;
      }
    }
    if (ok) out.push(w);
  });
  return out;
}
