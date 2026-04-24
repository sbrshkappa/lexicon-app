import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Card } from '../game/types';
import { LetterCard } from './LetterCard';
import { colors, typography, spacing, radius, cardSize } from '../theme';

export interface DeckIndicatorProps {
  deckCount: number;
  topDiscard: Card | null;
  discardCount: number;
}

export const DeckIndicator: React.FC<DeckIndicatorProps> = ({
  deckCount,
  topDiscard,
  discardCount,
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.stack}>
        <Text style={[typography.overline, styles.label]}>Draw</Text>
        <View style={[styles.deckBack, { width: 44, height: 60 }]}>
          <Text style={styles.deckBackMark}>L</Text>
        </View>
        <Text style={styles.count}>{deckCount}</Text>
      </View>
      <View style={[styles.stack, { marginLeft: spacing.lg }]}>
        <Text style={[typography.overline, styles.label]}>Discard</Text>
        {topDiscard ? (
          <LetterCard card={topDiscard} variant="board" />
        ) : (
          <View style={[styles.empty, { width: 44, height: 60 }]} />
        )}
        <Text style={styles.count}>{discardCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stack: {
    alignItems: 'center',
  },
  label: {
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  deckBack: {
    backgroundColor: colors.cardBack,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckBackMark: {
    ...typography.cardLetter,
    fontSize: 24,
    color: colors.paper,
    fontStyle: 'italic',
  },
  empty: {
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.paperEdge,
    backgroundColor: 'transparent',
  },
  count: {
    ...typography.small,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
});
