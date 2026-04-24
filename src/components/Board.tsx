import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlayedWord } from '../game/types';
import { WordRow } from './WordRow';
import { colors, spacing, typography, radius } from '../theme';

export interface BoardProps {
  words: PlayedWord[];
  selectedWordId: string | null;
  onSelectWord: (id: string | null) => void;
  /** When set, tapping a word should do nothing */
  locked?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  words,
  selectedWordId,
  onSelectWord,
  locked,
}) => {
  if (words.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[typography.overline, { color: colors.inkMuted }]}>
          The Table
        </Text>
        <Text style={[typography.h3, styles.emptyTitle]}>Empty</Text>
        <Text style={[typography.body, { color: colors.inkMuted, textAlign: 'center' }]}>
          Play your first word to begin.{'\n'}Compose a word from your hand, then tap Play.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[typography.overline, { color: colors.inkMuted, marginBottom: spacing.sm }]}>
        The Table · {words.length} {words.length === 1 ? 'word' : 'words'}
      </Text>
      {words.map((w) => (
        <WordRow
          key={w.id}
          word={w}
          selected={!locked && selectedWordId === w.id}
          onPress={
            locked
              ? undefined
              : () => onSelectWord(selectedWordId === w.id ? null : w.id)
          }
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
