import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Card } from '../game/types';
import { LetterCard } from './LetterCard';
import { spacing, cardSize } from '../theme';

export interface HandProps {
  cards: Card[];
  selectedIds: string[];
  disabled?: boolean;
  onCardPress: (id: string) => void;
}

// Must match the lift amount in LetterCard
const LIFT = 24;
const MIN_STEP = 28;
const MAX_STEP = 44;

export const Hand: React.FC<HandProps> = ({ cards, selectedIds, disabled, onCardPress }) => {
  const { width: screenWidth } = useWindowDimensions();

  if (cards.length === 0) return null;

  // How many px each card's left edge is offset from the previous card.
  // Scales down automatically for large hands or narrow screens.
  const step =
    cards.length <= 1
      ? cardSize.width
      : Math.min(
          MAX_STEP,
          Math.max(MIN_STEP, Math.floor((screenWidth - 32 - cardSize.width) / (cards.length - 1))),
        );

  const containerWidth =
    cards.length === 1 ? cardSize.width : (cards.length - 1) * step + cardSize.width;

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
                  left: idx * step,
                  // Natural fan stacking: higher index = on top.
                  // No boost for selected cards — the selected card's visible strip
                  // (its left `step` px) is always accessible because its right
                  // neighbor (higher zIndex) wins only the hidden overlap area.
                  zIndex: idx,
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
    height: cardSize.height + LIFT + 4,
  },
  cardWrapper: {
    position: 'absolute',
    top: LIFT,
  },
});
