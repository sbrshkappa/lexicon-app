import { Card, Letter } from './types';

/**
 * Lexicon card distribution & point values from the original Waddingtons deck.
 * Source: Wikipedia article on Lexicon (card game).
 *
 * Distribution (52 cards):
 *   A, E, I          x4 each  = 12
 *   O, U             x3 each  = 6
 *   H, L, R, S, T, W x3 each  = 18
 *   B, C, D, F, G, J, K, M, N, P, Q, V, X, Y, Z x1 each = 15
 *   Master (wild)    x1       = 1
 *                               Total: 52
 *
 * Point values (penalty when left in hand):
 *   A, E, I: 10
 *   C, H, K, L, M, N, O, P, R, S, T, U, W: 8
 *   D, J, V: 6
 *   G, Q, Y: 4
 *   B, F, X, Z: 2
 *   Master: 15
 */

const LETTER_COUNTS: Record<Letter, number> = {
  A: 4, E: 4, I: 4,
  O: 3, U: 3,
  H: 3, L: 3, R: 3, S: 3, T: 3, W: 3,
  B: 1, C: 1, D: 1, F: 1, G: 1, J: 1, K: 1, M: 1, N: 1,
  P: 1, Q: 1, V: 1, X: 1, Y: 1, Z: 1,
};

const POINT_VALUES: Record<Letter, number> = {
  A: 10, E: 10, I: 10,
  C: 8, H: 8, K: 8, L: 8, M: 8, N: 8, O: 8, P: 8,
  R: 8, S: 8, T: 8, U: 8, W: 8,
  D: 6, J: 6, V: 6,
  G: 4, Q: 4, Y: 4,
  B: 2, F: 2, X: 2, Z: 2,
};

export const WILD_POINTS = 15;

export function letterPoints(letter: Letter): number {
  return POINT_VALUES[letter];
}

let cardIdCounter = 0;
function nextCardId(): string {
  cardIdCounter += 1;
  return `c${cardIdCounter.toString(36)}`;
}

/** Reset counter — useful for tests / deterministic seeding. */
export function __resetCardIds(): void {
  cardIdCounter = 0;
}

export function buildDeck(): Card[] {
  const deck: Card[] = [];

  // Letter cards
  (Object.keys(LETTER_COUNTS) as Letter[]).forEach((letter) => {
    const count = LETTER_COUNTS[letter];
    for (let i = 0; i < count; i++) {
      deck.push({
        id: nextCardId(),
        letter,
        points: POINT_VALUES[letter],
        isWild: false,
      });
    }
  });

  // One Master (wild) card
  deck.push({
    id: nextCardId(),
    letter: null,
    points: WILD_POINTS,
    isWild: true,
  });

  return deck;
}

/**
 * Fisher-Yates shuffle. Accepts an optional seeded rng for determinism.
 * Returns a new array; does not mutate input.
 */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Deal `n` cards from top of deck (end of array). Returns [drawn, remaining]. */
export function dealFromTop(deck: Card[], n: number): [Card[], Card[]] {
  const take = Math.min(n, deck.length);
  const drawn = deck.slice(deck.length - take).reverse();
  const remaining = deck.slice(0, deck.length - take);
  return [drawn, remaining];
}

/** The "effective" letter of a card — wilds use their assignedLetter. */
export function effectiveLetter(card: Card): Letter | null {
  if (card.isWild) return card.assignedLetter ?? null;
  return card.letter;
}

/** Build a string from an ordered list of cards. Wilds without assignment => '?'. */
export function cardsToWord(cards: Card[]): string {
  return cards
    .map((c) => effectiveLetter(c) ?? '?')
    .join('');
}
