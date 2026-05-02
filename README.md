# Lexo

A pass-and-play implementation of **Lexicon** (David Whitelaw, 1932) in React Native + Expo. One codebase, runs on iOS, Android, and the web.

Two players (or three, or four) share a device and take turns building words from a 52-card letter deck. Aesthetic is intentionally restrained — warm paper, ink text, a burgundy accent — so the cards and typography can do the talking.

## Setup

Requires Node 18+.

```bash
npm install
```

Then run on the platform of your choice:

```bash
npm run web      # browser (fastest iteration)
npm run ios      # iOS simulator (requires macOS + Xcode)
npm run android  # Android emulator
```

Or run `npm start` and scan the QR code in the Expo Go app on a physical device.

## How to Play

### The rules (abridged)

Each player is dealt 10 cards. On your turn you may:

1. **Play a new word** — Lay down 2+ cards from your hand as a valid dictionary word.
2. **Extend a word** — Add letters before and/or after any word already on the table, forming a new valid word.
3. **Discard & draw** — Swap one card with the top of the draw pile. Ends your turn.

The first player to empty their hand wins the round. Every other player tallies the point value of cards left in hand as **penalty points**. At 100 penalty points you're eliminated; last player standing wins.

Card values match the original 1932 Waddingtons deck: vowels A/E/I are worth 10, most other letters 8, down to B/F/X/Z at 2, plus one Master (wild) card worth 15.

### The UI

- **Tap cards in your hand** to stage them for a word. Tap again to unstage.
- **Tap a word on the table** to target it for extension. The composer splits — your cards can go **before** or **after** the target word.
- The Master card opens a letter picker the moment you stage it. Tap the card in the composer again to change your choice.
- **Pass the device** overlay appears between turns so players don't peek at each others' hands.

## Project structure

```
src/
├── App.tsx                # root, fonts, routing
├── game/                  # pure, framework-free game logic
│   ├── types.ts           # Card, Player, GameState, Action types
│   ├── deck.ts            # 52-card construction, shuffle, deal
│   ├── dictionary.ts      # word validation
│   └── engine.ts          # applyAction, scoring, round/game end
├── data/
│   └── wordlist.ts        # bundled 5.2k common words
├── store/
│   └── gameStore.ts       # Zustand store (screens, toasts, game)
├── screens/
│   ├── HomeScreen.tsx
│   ├── SetupScreen.tsx
│   ├── GameScreen.tsx     # the main interactive surface
│   ├── RoundEndScreen.tsx
│   └── GameEndScreen.tsx
├── components/
│   ├── LetterCard.tsx     # the foundational card with press+select animations
│   ├── Hand.tsx           # horizontal scroll of the current player's cards
│   ├── Board.tsx          # scrolling list of played words
│   ├── WordRow.tsx        # one played word, selectable
│   ├── WordBuilder.tsx    # composition area + live preview
│   ├── DeckIndicator.tsx  # draw/discard pile visual
│   ├── PlayerBar.tsx      # name, score, active state
│   ├── HandoffOverlay.tsx # pass-the-phone screen
│   ├── WildLetterPicker.tsx
│   ├── ToastHost.tsx
│   └── Button.tsx
└── theme/
    ├── colors.ts          # warm paper, ink, burgundy
    ├── typography.ts      # Fraunces (serif display) + Inter (body)
    └── spacing.ts         # 4pt scale, spring configs, card sizes
```

## Architecture notes

- **`src/game/` is pure.** No React Native imports — same code could drive a server, an AI opponent, or tests. `applyAction(state, action)` is the single funnel for every rule change and returns a new immutable state (or an error).
- **Zustand** holds both UI flags (current screen, toasts, handoff overlay) and the game state. Keeps subscriptions cheap and avoids prop-drilling through the screen tree.
- **Reanimated 3** runs card spring/lift animations on the UI thread — taps feel instant on device. Layout animations on the board let words reflow smoothly when extended.
- **Fonts via Expo Google Fonts.** Fraunces gives the letter cards literary weight; Inter handles UI chrome. No reliance on system fonts, so the look is consistent across iOS, Android, and web.
- **Haptics** fire on card selection and on success/error outcomes for iOS and Android; web is a no-op.
- **Dictionary** is a `Set<string>` of ~5,200 common English words bundled at build time for offline play. Swap in `src/data/wordlist.ts` for a larger corpus (SCOWL, ENABLE, TWL) if you want harsher validation.

## v1 scope and what's next

### What v1 includes

- 2–4 players, pass-and-play
- Full 52-card Lexicon deck with correct letter distribution and point values
- Play new word / Extend word (before or after) / Discard & draw
- Wild-card assignment with a letter picker
- Dictionary validation
- Automatic round end when a player empties their hand
- Per-round scoring, penalty point accumulation, elimination at 100 points
- Final scoreboard

### Deferred (intentional gaps)

- **Card exchange / steal.** The original rules allow swapping cards between your hand and a word already in play (e.g. trade your F for the G in GAME to make FAME). It's a great mechanic but complicates the UI — the engine types have a seam for it, and it's a natural next feature.
- **Word challenges.** Players can't challenge each other's words. Dictionary validation happens automatically at play time, so invalid words never hit the table.
- **Networked multiplayer.** Would need a backend (Supabase or a tiny Socket.io server). The game engine is already pure and serializable, so the action is straightforward: serialize `PlayerAction` over the wire and apply it on the other side.
- **AI opponent.** The pure engine + `wordsUsingLetters()` helper in `dictionary.ts` make this tractable. A reasonable first pass: enumerate all valid words from the hand, pick the longest.
- **Persistence.** No saved games yet. `@react-native-async-storage/async-storage` is in the dependency list as a hook for this.
- **Sound.** The aesthetic calls for something restrained — a subtle paper rustle on card play, a soft chime on round end.

## Credits

- Game design: David Whitelaw, 1932. Published by Waddingtons.
- Rules reference: Wikipedia article on Lexicon (card game).
- Bundled word list: ~5,200 common English words, curated for v1. Replace with a full dictionary for tournament play.
