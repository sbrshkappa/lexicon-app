import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { Card, Letter, PlayedWord } from '../game/types';
import { cardsToWord } from '../game/deck';
import { LetterCard } from './LetterCard';
import { colors, typography, spacing, radius } from '../theme';

export type BuilderMode =
  | { kind: 'idle' }
  | { kind: 'new-word' }
  | { kind: 'extend-before'; wordId: string }
  | { kind: 'extend-after'; wordId: string };

export interface WordBuilderProps {
  stagedCards: Card[];
  wildAssignments: Record<string, Letter>;
  mode: BuilderMode;
  targetWord: PlayedWord | null;
  onRemoveCard: (cardId: string) => void;
  onAssignWild: (cardId: string) => void;
}

/** Builds a preview word string incorporating wild assignments and mode. */
function previewText(
  staged: Card[],
  wilds: Record<string, Letter>,
  mode: BuilderMode,
  target: PlayedWord | null,
): string {
  const stagedResolved = staged.map((c) => {
    if (c.isWild) {
      return wilds[c.id] ?? '?';
    }
    return c.letter ?? '?';
  });
  if (!target) return stagedResolved.join('');

  const targetText = cardsToWord(target.cards);
  if (mode.kind === 'extend-before') {
    return stagedResolved.join('') + targetText;
  }
  if (mode.kind === 'extend-after') {
    return targetText + stagedResolved.join('');
  }
  return stagedResolved.join('');
}

export const WordBuilder: React.FC<WordBuilderProps> = ({
  stagedCards,
  wildAssignments,
  mode,
  targetWord,
  onRemoveCard,
  onAssignWild,
}) => {
  const preview = previewText(stagedCards, wildAssignments, mode, targetWord);

  const hint = (() => {
    switch (mode.kind) {
      case 'idle':
        return 'Tap cards from your hand to compose a word.';
      case 'new-word':
        return 'Playing as a new word';
      case 'extend-before':
        return `Prefixing "${targetWord ? cardsToWord(targetWord.cards) : '...'}"`;
      case 'extend-after':
        return `Extending "${targetWord ? cardsToWord(targetWord.cards) : '...'}"`;
    }
  })();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[typography.overline, { color: colors.inkMuted }]}>
          Composing
        </Text>
        <Text style={[typography.small, styles.hint]} numberOfLines={1}>
          {hint}
        </Text>
      </View>

      <View style={styles.stageRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stageContent}
        >
          {/* If extending after, show target word on the left */}
          {mode.kind === 'extend-after' && targetWord && (
            <View style={styles.targetBlock}>
              {targetWord.cards.map((c) => (
                <View key={`t-${c.id}`} style={styles.ghostSlot}>
                  <LetterCard card={c} variant="board" />
                </View>
              ))}
              <View style={styles.divider} />
            </View>
          )}

          {stagedCards.length === 0 ? (
            <View style={styles.placeholder}>
              <Text style={[typography.body, { color: colors.inkGhost }]}>—</Text>
            </View>
          ) : (
            stagedCards.map((c, i) => (
              <Animated.View
                key={c.id}
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(140)}
                layout={Layout.springify().damping(16)}
                style={styles.cardSlot}
              >
                <Pressable
                  onPress={() => onRemoveCard(c.id)}
                  onLongPress={() => c.isWild && onAssignWild(c.id)}
                >
                  <LetterCard
                    card={{
                      ...c,
                      assignedLetter: c.isWild ? wildAssignments[c.id] : c.assignedLetter,
                    }}
                    variant="hand"
                  />
                  {c.isWild && (
                    <Pressable
                      onPress={() => onAssignWild(c.id)}
                      style={styles.wildEditBtn}
                    >
                      <Text style={styles.wildEditText}>
                        {wildAssignments[c.id] ? 'Change' : 'Set letter'}
                      </Text>
                    </Pressable>
                  )}
                </Pressable>
              </Animated.View>
            ))
          )}

          {/* If extending before, show target word on the right */}
          {mode.kind === 'extend-before' && targetWord && (
            <View style={styles.targetBlock}>
              <View style={styles.divider} />
              {targetWord.cards.map((c) => (
                <View key={`t-${c.id}`} style={styles.ghostSlot}>
                  <LetterCard card={c} variant="board" />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.previewRow}>
        <Text style={[typography.overline, { color: colors.inkMuted }]}>Word</Text>
        <Text
          style={[
            typography.h2,
            styles.previewText,
            { color: preview.length >= 2 ? colors.ink : colors.inkGhost },
          ]}
          numberOfLines={1}
        >
          {preview || '—'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.paperDeep,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.paperEdge,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  hint: {
    color: colors.inkSoft,
    maxWidth: '70%',
  },
  stageRow: {
    minHeight: 96,
    justifyContent: 'center',
  },
  stageContent: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minHeight: 96,
  },
  cardSlot: {
    marginHorizontal: 3,
  },
  targetBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
  },
  ghostSlot: {
    marginHorizontal: 2,
    opacity: 0.9,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.inkGhost,
    marginHorizontal: spacing.sm,
  },
  placeholder: {
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  previewText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.base,
    letterSpacing: 1,
  },
  wildEditBtn: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  wildEditText: {
    ...typography.small,
    color: colors.wildAccent,
    fontWeight: '600',
    fontSize: 10,
  },
});
