# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run ios        # run on iOS simulator (boot simulator first with: xcrun simctl boot "iPhone 17")
npm run android    # run on Android emulator
npm run web        # run in browser (fastest iteration)
npm start          # start Metro bundler, then press i/a/w
npm run typecheck  # TypeScript check (no emit)
```

## Architecture

### Game Engine (`src/game/`)

The engine is a **pure functional state machine** — all logic is side-effect-free.

- `types.ts` — all data structures (`Card`, `GameState`, `PlayerAction`, `PlayedWord`, etc.)
- `engine.ts` — single entry point `applyAction(state, action)` returns `ActionResult { ok, error?, nextState? }`. Never mutates state.
- `deck.ts` — Waddingtons 52-card distribution, Fisher-Yates shuffle, wild card handling
- `dictionary.ts` — O(1) word validation via `Set.has()` against the wordlist

Wild cards: `Card.isWild = true`, `Card.letter = null`, `Card.assignedLetter` set at play time.

### State Management (`src/store/gameStore.ts`)

Zustand store with two concerns:
- **UI state**: `screen` (home → setup → game → round-end → game-end), `toasts`, `showHandoff`
- **Game state**: immutable `GameState` object

`store.act(action)` is the bridge: calls `applyAction()`, handles phase transitions (round-end/game-end), and triggers the handoff overlay when `currentPlayerIndex` changes. Navigation is driven entirely by the `screen` field — there is no React Navigation.

### Screen Flow (`src/App.tsx`, `src/screens/`)

Screens are conditionally rendered based on `screen` state — no router or navigator.

`GameScreen` is the most complex component. It holds local composition state (`stagedIds`, `wildAssignments`, `builderMode`, etc.) that resets each turn via a `useEffect` on `currentPlayerIndex`. This state lives locally (not in the store) because it is ephemeral per-turn.

### Theme (`src/theme/`)

- **Colors**: Warm paper (`#FAF7F2`), deep ink, burgundy accent (`#7A2E2E`), gold for wilds
- **Typography**: Fraunces (serif) for display/headings, Inter (sans) for UI/body
- **Spacing**: 4pt grid; spring configs (`snappy`, `soft`, `bouncy`) and timing constants live in `spacing.ts`

### Animations

Reanimated 2 throughout. `LetterCard` uses shared values for selection lift, press scale, and enter fade. Spring configs are imported from `src/theme/spacing.ts`. Haptic feedback is wrapped in a platform guard (`Platform.OS === 'web'` skips it).

## Known Issues & Watch-outs

- **Reanimated `Layout` import** — current version uses `Layout` in `WordRow.tsx` and `WordBuilder.tsx`; newer Reanimated renames it to `LinearTransition`. Don't upgrade Reanimated without updating those files.
- **Handoff overlay race** — overlay shows after `applyAction` flips state, so there's a brief flash where the outgoing player sees the incoming player's hand. Fix: show overlay before state updates.
- **`gap` in StyleSheet** (`GameScreen.tsx`) — valid on RN 0.71+ but verify web rendering if layout issues appear.
- **Dictionary is ~5,200 words** — valid words will get false negatives. Replace with SCOWL/ENABLE/TWL when ready.

## Intentionally Deferred

These are not bugs — the architecture already has seams for them:

- **Card exchange/steal** — swap cards between hand and board words. `PlayerAction` is a discriminated union ready to extend.
- **Networked multiplayer** — engine is pure and serializable; wire `PlayerAction` over sockets.
- **AI opponent** — `wordsUsingLetters()` in `dictionary.ts` is the starting hook.
- **Persistence** — `@react-native-async-storage/async-storage` is already in deps.
- **Word challenges** — dictionary auto-validates at play time; no challenge mechanic yet.
