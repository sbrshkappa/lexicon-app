import {
  Card,
  GameState,
  Player,
  PlayedWord,
  PlayerAction,
  ActionResult,
  RoundResult,
  Letter,
} from './types';
import { buildDeck, cardsToWord, dealFromTop, shuffle } from './deck';
import { isValidWord } from './dictionary';

// ---- Constants -----------------------------------------------------------

export const HAND_SIZE = 10;
export const DEFAULT_ELIMINATION_THRESHOLD = 100;

// ---- Construction --------------------------------------------------------

let playedWordIdCounter = 0;
function nextWordId(): string {
  playedWordIdCounter += 1;
  return `w${playedWordIdCounter.toString(36)}`;
}

export function makePlayer(id: string, name: string): Player {
  return {
    id,
    name: name.trim() || `Player ${id}`,
    hand: [],
    score: 0,
    isEliminated: false,
  };
}

/**
 * Create a fresh game. `playerNames` must have 2-4 entries.
 */
export function createGame(playerNames: string[]): GameState {
  if (playerNames.length < 2 || playerNames.length > 4) {
    throw new Error('Lexicon supports 2-4 players with a single deck.');
  }

  const players: Player[] = playerNames.map((name, i) =>
    makePlayer(`p${i + 1}`, name),
  );

  return dealNewRound({
    phase: 'playing',
    players,
    currentPlayerIndex: 0,
    deck: [],
    discard: [],
    board: [],
    turnCount: 0,
    round: 0,
    eliminationThreshold: DEFAULT_ELIMINATION_THRESHOLD,
    lastRoundResult: null,
    events: [],
  });
}

/**
 * Shuffle a fresh deck, deal HAND_SIZE cards per player, flip one card to
 * start the discard pile. Clears the board.
 */
export function dealNewRound(state: GameState): GameState {
  let deck = shuffle(buildDeck());
  const players = state.players.map((p) => ({ ...p, hand: [] as Card[] }));

  for (let i = 0; i < HAND_SIZE; i++) {
    players.forEach((p) => {
      const [drawn, rest] = dealFromTop(deck, 1);
      p.hand.push(...drawn);
      deck = rest;
    });
  }

  // Flip one card to start the discard pile
  const [firstDiscard, remainingDeck] = dealFromTop(deck, 1);
  // Pick whoever wasn't last round's winner, or the next player as opener.
  // (For round 1 we use currentPlayerIndex = 0 deterministically.)
  const startIdx =
    state.round === 0
      ? 0
      : (state.players.findIndex((p) => p.id === state.lastRoundResult?.winnerId) + 1) %
        state.players.length;

  return {
    ...state,
    phase: 'playing',
    players,
    deck: remainingDeck,
    discard: firstDiscard,
    board: [],
    currentPlayerIndex: startIdx,
    turnCount: 0,
    round: state.round + 1,
    events: [],
  };
}

// ---- Helpers -------------------------------------------------------------

function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

function advanceTurn(state: GameState): GameState {
  let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
  // Skip eliminated players
  let safety = 0;
  while (state.players[nextIdx].isEliminated && safety < state.players.length) {
    nextIdx = (nextIdx + 1) % state.players.length;
    safety++;
  }
  return {
    ...state,
    currentPlayerIndex: nextIdx,
    turnCount: state.turnCount + 1,
  };
}

/**
 * Remove cards from a hand by id. Returns [removed-in-order, remainingHand].
 * If any id isn't found, returns null.
 */
function removeCardsFromHand(
  hand: Card[],
  ids: string[],
): [Card[], Card[]] | null {
  const removed: Card[] = [];
  const remaining = [...hand];
  for (const id of ids) {
    const idx = remaining.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    removed.push(remaining[idx]);
    remaining.splice(idx, 1);
  }
  return [removed, remaining];
}

/**
 * Resolve wild assignments onto the list of cards. Returns a new array where
 * wilds get `assignedLetter` set. Returns null if a wild is missing its assignment.
 */
function applyWildAssignments(
  cards: Card[],
  assignments: Record<string, Letter> = {},
): Card[] | null {
  const result: Card[] = [];
  for (const c of cards) {
    if (c.isWild) {
      const assigned = assignments[c.id] ?? c.assignedLetter;
      if (!assigned) return null;
      result.push({ ...c, assignedLetter: assigned });
    } else {
      result.push({ ...c });
    }
  }
  return result;
}

// ---- Action: play a new word --------------------------------------------

function actPlayWord(
  state: GameState,
  cardIds: string[],
  wildAssignments: Record<string, Letter> = {},
): ActionResult {
  const player = currentPlayer(state);

  if (cardIds.length < 2) {
    return { ok: false, error: 'A word must have at least 2 letters.' };
  }

  const removed = removeCardsFromHand(player.hand, cardIds);
  if (!removed) return { ok: false, error: 'Some selected cards are not in your hand.' };
  const [drawn, newHand] = removed;

  const resolved = applyWildAssignments(drawn, wildAssignments);
  if (!resolved) return { ok: false, error: 'Assign a letter to your wild card.' };

  const word = cardsToWord(resolved);
  if (!isValidWord(word)) {
    return { ok: false, error: `"${word}" isn't in the dictionary.` };
  }

  const playedWord: PlayedWord = {
    id: nextWordId(),
    cards: resolved,
    ownerHistory: [player.id],
    turnPlayed: state.turnCount,
  };

  const players = state.players.map((p) =>
    p.id === player.id ? { ...p, hand: newHand } : p,
  );
  const board = [...state.board, playedWord];

  let next: GameState = {
    ...state,
    players,
    board,
    events: [
      ...state.events,
      { type: 'word-played', playerId: player.id, word, turn: state.turnCount },
    ],
  };

  // Check for round-end (player emptied their hand)
  const after = players.find((p) => p.id === player.id)!;
  if (after.hand.length === 0) {
    next = endRound(next, player.id);
    return { ok: true, nextState: next };
  }

  return { ok: true, nextState: advanceTurn(next) };
}

// ---- Action: extend an existing word ------------------------------------

function actExtendWord(
  state: GameState,
  wordId: string,
  prependIds: string[],
  appendIds: string[],
  wildAssignments: Record<string, Letter> = {},
): ActionResult {
  if (prependIds.length + appendIds.length === 0) {
    return { ok: false, error: 'Select at least one card to extend the word.' };
  }

  const player = currentPlayer(state);
  const word = state.board.find((w) => w.id === wordId);
  if (!word) return { ok: false, error: 'That word is not on the board.' };

  // Remove prepend + append from hand
  const allIds = [...prependIds, ...appendIds];
  const removed = removeCardsFromHand(player.hand, allIds);
  if (!removed) return { ok: false, error: 'Some selected cards are not in your hand.' };
  const [drawn, newHand] = removed;

  const prependDrawn = drawn.slice(0, prependIds.length);
  const appendDrawn = drawn.slice(prependIds.length);

  const resolvedPrepend = applyWildAssignments(prependDrawn, wildAssignments);
  const resolvedAppend = applyWildAssignments(appendDrawn, wildAssignments);
  if (!resolvedPrepend || !resolvedAppend) {
    return { ok: false, error: 'Assign a letter to your wild card.' };
  }

  const newCards = [...resolvedPrepend, ...word.cards, ...resolvedAppend];
  const newWord = cardsToWord(newCards);
  const oldWord = cardsToWord(word.cards);

  if (!isValidWord(newWord)) {
    return { ok: false, error: `"${newWord}" isn't in the dictionary.` };
  }
  if (newWord === oldWord) {
    return { ok: false, error: 'The word must change.' };
  }

  const updatedWord: PlayedWord = {
    ...word,
    cards: newCards,
    ownerHistory: word.ownerHistory.includes(player.id)
      ? word.ownerHistory
      : [...word.ownerHistory, player.id],
  };

  const board = state.board.map((w) => (w.id === wordId ? updatedWord : w));
  const players = state.players.map((p) =>
    p.id === player.id ? { ...p, hand: newHand } : p,
  );

  let next: GameState = {
    ...state,
    players,
    board,
    events: [
      ...state.events,
      {
        type: 'word-extended',
        playerId: player.id,
        from: oldWord,
        to: newWord,
        turn: state.turnCount,
      },
    ],
  };

  const after = players.find((p) => p.id === player.id)!;
  if (after.hand.length === 0) {
    next = endRound(next, player.id);
    return { ok: true, nextState: next };
  }

  return { ok: true, nextState: advanceTurn(next) };
}

// ---- Action: discard + draw ---------------------------------------------

function actDiscardDraw(state: GameState, cardId: string): ActionResult {
  const player = currentPlayer(state);
  const removed = removeCardsFromHand(player.hand, [cardId]);
  if (!removed) return { ok: false, error: 'That card is not in your hand.' };
  const [drawn, newHand] = removed;
  const discarded = drawn[0];

  // Refill the deck from discard if needed (keep top discard)
  let deck = state.deck;
  let discard = [...state.discard, discarded];

  let finalDraw: Card[] = [];
  if (deck.length === 0) {
    if (discard.length > 1) {
      const top = discard[discard.length - 1];
      const rest = discard.slice(0, -1);
      deck = shuffle(rest);
      discard = [top];
    }
  }
  if (deck.length > 0) {
    const [d, remaining] = dealFromTop(deck, 1);
    finalDraw = d;
    deck = remaining;
  }

  const updatedHand = [...newHand, ...finalDraw];
  const players = state.players.map((p) =>
    p.id === player.id ? { ...p, hand: updatedHand } : p,
  );

  const next: GameState = {
    ...state,
    players,
    deck,
    discard,
    events: [
      ...state.events,
      { type: 'discard-draw', playerId: player.id, turn: state.turnCount },
    ],
  };

  return { ok: true, nextState: advanceTurn(next) };
}

// ---- Round / game end ---------------------------------------------------

function endRound(state: GameState, winnerId: string): GameState {
  const perPlayer = state.players.map((p) => {
    if (p.id === winnerId) {
      return { playerId: p.id, pointsGained: 0, cardsHeld: [] as Card[] };
    }
    const points = p.hand.reduce((s, c) => s + c.points, 0);
    return { playerId: p.id, pointsGained: points, cardsHeld: [...p.hand] };
  });

  // Apply penalties
  const players = state.players.map((p) => {
    const entry = perPlayer.find((e) => e.playerId === p.id)!;
    const newScore = p.score + entry.pointsGained;
    return {
      ...p,
      score: newScore,
      isEliminated: newScore >= state.eliminationThreshold,
    };
  });

  const result: RoundResult = { winnerId, perPlayer };

  const activePlayers = players.filter((p) => !p.isEliminated);
  const phase = activePlayers.length <= 1 ? 'game-end' : 'round-end';

  return {
    ...state,
    players,
    phase,
    lastRoundResult: result,
    events: [...state.events, { type: 'round-over', winnerId }],
  };
}

// ---- Public: apply any action -------------------------------------------

export function applyAction(
  state: GameState,
  action: PlayerAction,
): ActionResult {
  if (state.phase !== 'playing') {
    return { ok: false, error: 'The round is not active.' };
  }
  if (currentPlayer(state).isEliminated) {
    return { ok: false, error: 'Current player is eliminated.' };
  }

  switch (action.type) {
    case 'play-word':
      return actPlayWord(state, action.cardIds, action.wildAssignments);
    case 'extend-word':
      return actExtendWord(
        state,
        action.wordId,
        action.prependCardIds,
        action.appendCardIds,
        action.wildAssignments,
      );
    case 'discard-draw':
      return actDiscardDraw(state, action.cardId);
  }
}

/**
 * Start the next round after a round-end screen. Returns a new state dealt.
 */
export function startNextRound(state: GameState): GameState {
  if (state.phase !== 'round-end') return state;
  return dealNewRound(state);
}

/**
 * Returns the game winner (for 'game-end' phase): the last non-eliminated player,
 * or if all eliminated, the one with the lowest score.
 */
export function gameWinner(state: GameState): Player | null {
  const alive = state.players.filter((p) => !p.isEliminated);
  if (alive.length === 1) return alive[0];
  if (alive.length === 0) {
    return [...state.players].sort((a, b) => a.score - b.score)[0];
  }
  return null;
}
