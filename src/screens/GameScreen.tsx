import React, { useMemo, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';
import { Card, Letter, PlayedWord } from '../game/types';
import { PlayerBar } from '../components/PlayerBar';
import { Board } from '../components/Board';
import { Hand } from '../components/Hand';
import { WordBuilder, BuilderMode } from '../components/WordBuilder';
import { Button } from '../components/Button';
import { DeckIndicator } from '../components/DeckIndicator';
import { WildLetterPicker } from '../components/WildLetterPicker';
import { HandoffOverlay } from '../components/HandoffOverlay';
import { colors, typography, spacing, radius } from '../theme';

type DiscardPrompt = { cardId: string } | null;

const haptic = (kind: 'select' | 'success' | 'warning' | 'error') => {
  if (Platform.OS === 'web') return;
  try {
    if (kind === 'select') Haptics.selectionAsync();
    else if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (kind === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // no-op
  }
};

export const GameScreen: React.FC = () => {
  const game = useGameStore((s) => s.game)!;
  const showHandoff = useGameStore((s) => s.showHandoff);
  const setShowHandoff = useGameStore((s) => s.setShowHandoff);
  const act = useGameStore((s) => s.act);
  const endGame = useGameStore((s) => s.endGame);

  // Local composition state — resets each turn
  const [stagedIds, setStagedIds] = useState<string[]>([]);
  const [wildAssignments, setWildAssignments] = useState<Record<string, Letter>>({});
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [builderMode, setBuilderMode] = useState<BuilderMode>({ kind: 'idle' });
  const [wildPickerFor, setWildPickerFor] = useState<string | null>(null);
  const [discardPrompt, setDiscardPrompt] = useState<DiscardPrompt>(null);

  const resetComposition = useCallback(() => {
    setStagedIds([]);
    setWildAssignments({});
    setSelectedWordId(null);
    setBuilderMode({ kind: 'idle' });
    setDiscardPrompt(null);
  }, []);

  // Reset composition when player changes
  React.useEffect(() => {
    resetComposition();
  }, [game.currentPlayerIndex, resetComposition]);

  const currentPlayer = game.players[game.currentPlayerIndex];
  const stagedCards: Card[] = useMemo(
    () => stagedIds.map((id) => currentPlayer.hand.find((c) => c.id === id)!).filter(Boolean),
    [stagedIds, currentPlayer.hand],
  );
  const selectedWord: PlayedWord | null = useMemo(
    () => (selectedWordId ? game.board.find((w) => w.id === selectedWordId) ?? null : null),
    [selectedWordId, game.board],
  );

  // ---- Card selection ----

  const onCardPress = (id: string) => {
    if (discardPrompt) {
      setDiscardPrompt({ cardId: id });
      haptic('select');
      return;
    }
    if (stagedIds.includes(id)) {
      setStagedIds(stagedIds.filter((x) => x !== id));
    } else {
      setStagedIds([...stagedIds, id]);
      const card = currentPlayer.hand.find((c) => c.id === id);
      if (card?.isWild && !wildAssignments[id]) {
        // Prompt for wild assignment immediately
        setWildPickerFor(id);
      }
    }
    haptic('select');
    if (builderMode.kind === 'idle') setBuilderMode({ kind: 'new-word' });
  };

  const removeStagedCard = (id: string) => {
    setStagedIds(stagedIds.filter((x) => x !== id));
    // clear its wild assignment
    if (wildAssignments[id]) {
      const next = { ...wildAssignments };
      delete next[id];
      setWildAssignments(next);
    }
  };

  const onSelectWord = (id: string | null) => {
    if (id === null) {
      setSelectedWordId(null);
      if (builderMode.kind === 'extend-before' || builderMode.kind === 'extend-after') {
        setBuilderMode(stagedIds.length > 0 ? { kind: 'new-word' } : { kind: 'idle' });
      }
      return;
    }
    setSelectedWordId(id);
    haptic('select');
    // If cards are already staged, default to append
    if (stagedIds.length > 0) {
      setBuilderMode({ kind: 'extend-after', wordId: id });
    } else {
      setBuilderMode({ kind: 'idle' });
    }
  };

  // ---- Action handlers ----

  const handlePlayNewWord = () => {
    if (stagedCards.length < 1) {
      haptic('warning');
      return;
    }
    const ok = act({
      type: 'play-word',
      cardIds: stagedIds,
      wildAssignments,
    });
    if (ok) haptic('success');
    else haptic('error');
  };

  const handleExtend = (direction: 'before' | 'after') => {
    if (!selectedWordId || stagedIds.length === 0) {
      haptic('warning');
      return;
    }
    const ok = act({
      type: 'extend-word',
      wordId: selectedWordId,
      prependCardIds: direction === 'before' ? stagedIds : [],
      appendCardIds: direction === 'after' ? stagedIds : [],
      wildAssignments,
    });
    if (ok) haptic('success');
    else haptic('error');
  };

  const handleConfirmDiscard = () => {
    if (!discardPrompt?.cardId) return;
    const ok = act({ type: 'discard-draw', cardId: discardPrompt.cardId });
    if (ok) haptic('success');
    else haptic('error');
  };

  const handleQuitGame = () => {
    if (Platform.OS === 'web') {
      // Web has no Alert — just end
      endGame();
      return;
    }
    Alert.alert(
      'End game?',
      'Returning home will discard the current game.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End game', style: 'destructive', onPress: () => endGame() },
      ],
    );
  };

  // ---- Derived UI state ----

  const canPlayNew = stagedCards.length >= 1 && (builderMode.kind === 'new-word' || !selectedWordId);
  const canExtend = selectedWordId !== null && stagedIds.length > 0;

  const topDiscard = game.discard.length > 0 ? game.discard[game.discard.length - 1] : null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={handleQuitGame} hitSlop={12}>
          <Text style={[typography.small, { color: colors.inkMuted }]}>← Exit</Text>
        </Pressable>
        <Text style={[typography.overline, { color: colors.inkMuted }]}>
          Round {game.round} · Turn {game.turnCount + 1}
        </Text>
        <DeckIndicator
          deckCount={game.deck.length}
          topDiscard={topDiscard}
          discardCount={game.discard.length}
        />
      </View>

      {/* All players — compact strip */}
      <View style={styles.players}>
        {game.players.map((p) => (
          <View key={p.id} style={styles.playerBarWrap}>
            <PlayerBar
              player={p}
              active={p.id === currentPlayer.id}
              cardsInHand={p.hand.length}
              compact
            />
          </View>
        ))}
      </View>

      {/* Board */}
      <View style={styles.boardWrap}>
        <Board
          words={game.board}
          selectedWordId={selectedWordId}
          onSelectWord={onSelectWord}
        />
      </View>

      {/* Composition area */}
      <WordBuilder
        stagedCards={stagedCards}
        wildAssignments={wildAssignments}
        mode={builderMode}
        targetWord={selectedWord}
        onRemoveCard={removeStagedCard}
        onAssignWild={(id) => setWildPickerFor(id)}
      />

      {/* Action row */}
      <View style={styles.actionRow}>
        {discardPrompt !== null ? (
          <>
            <Button
              label="Cancel"
              variant="ghost"
              size="md"
              onPress={() => setDiscardPrompt(null)}
            />
            <Button
              label={discardPrompt.cardId ? 'Confirm Discard' : 'Tap a card to discard'}
              variant="primary"
              size="md"
              disabled={!discardPrompt.cardId}
              onPress={handleConfirmDiscard}
            />
          </>
        ) : selectedWordId ? (
          <>
            <Button
              label="Add before"
              variant="secondary"
              size="md"
              disabled={!canExtend}
              onPress={() => handleExtend('before')}
            />
            <Button
              label="Add after"
              variant="primary"
              size="md"
              disabled={!canExtend}
              onPress={() => handleExtend('after')}
            />
          </>
        ) : (
          <>
            <Button
              label="Discard & Draw"
              variant="ghost"
              size="md"
              disabled={stagedIds.length > 0}
              onPress={() => setDiscardPrompt({ cardId: '' })}
            />
            <Button
              label="Play Word"
              variant="primary"
              size="md"
              disabled={!canPlayNew}
              onPress={handlePlayNewWord}
            />
          </>
        )}
      </View>

      {/* Hand */}
      <View style={styles.handWrap}>
        <Hand
          cards={currentPlayer.hand}
          selectedIds={discardPrompt ? (discardPrompt.cardId ? [discardPrompt.cardId] : []) : stagedIds}
          onCardPress={onCardPress}
        />
      </View>

      {/* Handoff overlay — hides current player's hand while passing device */}
      <HandoffOverlay
        visible={showHandoff}
        nextPlayerName={currentPlayer.name}
        onContinue={() => setShowHandoff(false)}
      />

      {/* Wild-letter picker */}
      <WildLetterPicker
        visible={wildPickerFor !== null}
        current={wildPickerFor ? wildAssignments[wildPickerFor] : undefined}
        onPick={(letter) => {
          if (wildPickerFor) {
            setWildAssignments({ ...wildAssignments, [wildPickerFor]: letter });
          }
          setWildPickerFor(null);
        }}
        onCancel={() => setWildPickerFor(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  players: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  playerBarWrap: {
    flex: 1,
  },
  boardWrap: {
    flex: 1,
    minHeight: 100,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.paperDeep,
    borderBottomWidth: 1,
    borderColor: colors.paperEdge,
    gap: spacing.sm,
  },
  handWrap: {
    paddingVertical: spacing.xs,
    backgroundColor: colors.paperDeep,
  },
});
