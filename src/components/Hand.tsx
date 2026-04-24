import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../game/types';
import { LetterCard } from './LetterCard';
import { spacing, cardSize } from '../theme';

export interface HandProps {
  cards: Card[];
  selectedIds: string[];
  disabled?: boolean;
  onCardPress: (id: string) => void;
}

// How many px each card peeks out from behind the next
const OVERLAP = 30;

export const Hand: React.FC<HandProps> = ({ cards, selectedIds, disabled, onCardPress }) => {
  if (cards.length === 0) return null;

  const containerWidth =
    cards.length === 1 ? cardSize.width : (cards.length - 1) * OVERLAP + cardSize.width;

  return (
    <View style={styles.outer}>
      <View style={[styles.fan, { width: containerWidth }]}>
        {cards.map((card, idx) => {
          const isSelected = selectedIds.includes(card.id);
          return (
            <View
              key={card.id}
              style={[
                styles.cardWrapper,
                {
                  left: idx * OVERLAP,
                  // Selected cards float above all others
                  zIndex: isSelected ? cards.length + 10 : idx,
                },
              ]}
            >
              <LetterCard
                card={card}
                selected={isSelected}
                disabled={disabled}
                variant="hand"
                enterDelay={idx * 40}
                onPress={() => onCardPress(card.id)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  fan: {
    position: 'relative',
    // cardSize.height + 20px headroom for the -18px selection lift
    height: cardSize.height + 20,
  },
  cardWrapper: {
    position: 'absolute',
    top: 18, // leave space above for selection lift
  },
});
