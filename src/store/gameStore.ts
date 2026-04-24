import { create } from 'zustand';
import {
  GameState,
  PlayerAction,
  createGame,
  applyAction,
  startNextRound,
} from '../game';

type Screen = 'home' | 'setup' | 'game' | 'round-end' | 'game-end' | 'how-to-play';

interface ToastMsg {
  id: number;
  text: string;
  kind: 'info' | 'error' | 'success';
}

interface UIState {
  // navigation
  screen: Screen;
  navigate: (s: Screen) => void;

  // toasts — small ephemeral messages
  toasts: ToastMsg[];
  pushToast: (text: string, kind?: ToastMsg['kind']) => void;
  dismissToast: (id: number) => void;

  // "pass phone" overlay — shown between player turns
  showHandoff: boolean;
  setShowHandoff: (v: boolean) => void;
}

interface GameStore extends UIState {
  game: GameState | null;

  newGame: (names: string[]) => void;
  endGame: () => void;
  act: (action: PlayerAction) => boolean;
  startNextRound: () => void;
}

let toastIdCounter = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  // UI state
  screen: 'home',
  navigate: (s) => set({ screen: s }),

  toasts: [],
  pushToast: (text, kind = 'info') => {
    toastIdCounter += 1;
    const id = toastIdCounter;
    set((state) => ({ toasts: [...state.toasts, { id, text, kind }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 2400);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  showHandoff: false,
  setShowHandoff: (v) => set({ showHandoff: v }),

  // Game state
  game: null,

  newGame: (names) => {
    const g = createGame(names);
    set({ game: g, screen: 'game', showHandoff: false });
  },

  endGame: () => set({ game: null, screen: 'home', showHandoff: false }),

  act: (action) => {
    const state = get().game;
    if (!state) return false;
    const result = applyAction(state, action);
    if (!result.ok) {
      get().pushToast(result.error ?? 'Invalid move', 'error');
      return false;
    }
    const next = result.nextState!;
    set({ game: next });
    // Handle phase transitions
    if (next.phase === 'round-end') {
      set({ screen: 'round-end' });
    } else if (next.phase === 'game-end') {
      set({ screen: 'game-end' });
    } else {
      // Trigger handoff overlay if player actually changed
      if (next.currentPlayerIndex !== state.currentPlayerIndex) {
        set({ showHandoff: true });
      }
    }
    return true;
  },

  startNextRound: () => {
    const state = get().game;
    if (!state) return;
    const next = startNextRound(state);
    set({ game: next, screen: 'game', showHandoff: false });
  },
}));
