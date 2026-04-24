import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { PlayedWord } from '../game/types';
import { LetterCard } from './LetterCard';
import { colors, radius, spacing, springs, typography } from '../theme';

export interface WordRowProps {
  word: PlayedWord;
  selected?: boolean;
  onPress?: () => void;
}

export const WordRow: React.FC<WordRowProps> = ({ word, selected = false, onPress }) => {
  const sel = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    sel.value = withSpring(selected ? 1 : 0, springs.soft);
  }, [selected, sel]);

  const wrapStyle = useAnimatedStyle(() => ({
    borderColor:
      sel.value > 0.5 ? colors.accent : colors.paperEdge,
    backgroundColor:
      sel.value > 0.5 ? 'rgba(122, 46, 46, 0.05)' : colors.paper,
    transform: [{ scale: 1 - (1 - sel.value) * 0 + sel.value * 0.01 }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(260)}
      layout={Layout.springify().damping(16).stiffness(180)}
      style={styles.outer}
    >
      <Pressable disabled={!onPress} onPress={onPress}>
        <Animated.View style={[styles.row, wrapStyle]}>
          {word.cards.map((c, i) => (
            <View key={c.id} style={styles.cardSlot}>
              <LetterCard card={c} variant="board" enterDelay={i * 30} />
            </View>
          ))}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outer: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  cardSlot: {
    marginHorizontal: 2,
  },
});
