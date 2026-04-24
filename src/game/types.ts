// ---- Cards ---------------------------------------------------------------

export type Letter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I'
  | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R'
  | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

/**
 * A physical card in the deck.
 * `letter` is null only for the Master (wild) card before it's played.
 * Once played in a word, a wild card's `assignedLetter` tells us what
 * letter it represents for that word.
 */
export interface Card {
  id: string;                 // stable unique id
  letter: Letter | null;      // null = wild
  points: number;             // point value
  isWild: boolean;
  assignedLetter?: Letter;    // set when wild is used in a word
}

// ---- Words (played on the board) -----------------------------------------

export interface PlayedWord {
  id: string;
  cards: Card[];              // ordered left-to-right
  ownerHistory: string[];     // player ids who've touched this word (cosmetic)
  turnPlayed: number;
}

// ---- Players -------------------------------------------------------------

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;              // accumulated PENALTY points (lower is better)
  isEliminated: boolean;
}

// ---- Game state ----------------------------------------------------------

export type GamePhase =
  | 'setup'          // entering names
  | 'playing'        // active play
  | 'round-end'      // round just ended — show scoring
  | 'game-end';      // someone hit 100+, game over

export interface RoundResult {
  winnerId: string;           // who went out
  perPlayer: Array<{
    playerId: string;
    pointsGained: number;     // penalty points from leftover cards
    cardsHeld: Card[];
  }>;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];               // draw pile (top is last element)
  discard: Card[];            // discard pile (top is last element)
  board: PlayedWord[];        // words on the table
  turnCount: number;
  round: number;
  eliminationThreshold: number; // default 100
  lastRoundResult: RoundResult | null;
  // A tiny event log for animations/toasts
  events: GameEvent[];
}

export type GameEvent =
  | { type: 'word-played'; playerId: string; word: string; turn: number }
  | { type: 'word-extended'; playerId: string; from: string; to: string; turn: number }
  | { type: 'discard-draw'; playerId: string; turn: number }
  | { type: 'round-over'; winnerId: string }
  | { type: 'invalid-word'; word: string };

// ---- Actions a player can take on their turn -----------------------------

export type PlayerAction =
  | {
      type: 'play-word';
      cardIds: string[];          // ordered: the word to play
      wildAssignments?: Record<string, Letter>; // cardId -> letter for wilds
    }
  | {
      type: 'extend-word';
      wordId: string;
      prependCardIds: string[];   // ordered, from hand
      appendCardIds: string[];    // ordered, from hand
      wildAssignments?: Record<string, Letter>;
    }
  | {
      type: 'discard-draw';
      cardId: string;             // card from hand to discard
    };

export interface ActionResult {
  ok: boolean;
  error?: string;
  nextState?: GameState;
}
