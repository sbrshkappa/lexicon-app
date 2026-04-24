import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card } from '../game/types';
import { LetterCard } from './LetterCard';
import { spacing, cardSize } from '../theme';

export interface HandProps {
  cards: Card[];
  selectedIds: string[];
  disabled?: boolean;
  onCardPress: (id: string) => void;
}

export const Hand: React.FC<HandProps> = ({ cards, selectedIds, disabled, onCardPress }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {cards.map((card, idx) => (
        <View key={card.id} style={styles.cardWrapper}>
          <LetterCard
            card={card}
            selected={selectedIds.includes(card.id)}
            disabled={disabled}
            variant="hand"
            enterDelay={idx * 40}
            onPress={() => onCardPress(card.id)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cardWrapper: {
    marginHorizontal: spacing.xs,
    // Leave headroom for the selection lift animation (-18px)
    paddingTop: 18,
    paddingBottom: 4,
  },
});
