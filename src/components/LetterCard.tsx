import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { Card } from '../game/types';
import { colors, typography, radius, springs, cardSize, boardCardSize } from '../theme';

export interface LetterCardProps {
  card: Card;
  selected?: boolean;
  disabled?: boolean;
  variant?: 'hand' | 'board' | 'stack';
  onPress?: () => void;
  /** Index in list; used for staggered entrance */
  enterDelay?: number;
}

export const LetterCard: React.FC<LetterCardProps> = ({
  card,
  selected = false,
  disabled = false,
  variant = 'hand',
  onPress,
  enterDelay = 0,
}) => {
  const size = variant === 'board' ? boardCardSize : cardSize;

  const pressed = useSharedValue(0);
  const selectedAnim = useSharedValue(selected ? 1 : 0);
  const entered = useSharedValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      entered.value = withSpring(1, springs.soft);
    }, enterDelay);
    return () => clearTimeout(t);
  }, [enterDelay, entered]);

  useEffect(() => {
    selectedAnim.value = withSpring(selected ? 1 : 0, springs.snappy);
  }, [selected, selectedAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    const lift = interpolate(selectedAnim.value, [0, 1], [0, -24]);
    const scale = interpolate(
      pressed.value,
      [0, 1],
      [1, 0.96],
    );
    const opacity = interpolate(entered.value, [0, 1], [0, 1]);
    const translateY =
      interpolate(entered.value, [0, 1], [12, 0]) + lift;
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(selectedAnim.value, [0, 1], [0, 1]);
    return { opacity };
  });

  const displayLetter = card.isWild
    ? card.assignedLetter ?? '★'
    : card.letter;

  const pointsText = card.points.toString();

  return (
    <Animated.View
      style={[styles.container, { width: size.width, height: size.height }, animatedStyle]}
    >
      {/* Selection glow */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          { borderRadius: size.radius + 4 },
          glowStyle,
        ]}
      />
      <Pressable
        disabled={disabled || !onPress}
        onPress={onPress}
        onPressIn={() => (pressed.value = withTiming(1, { duration: 80 }))}
        onPressOut={() => (pressed.value = withSpring(0, springs.snappy))}
        style={({ pressed: p }) => [
          styles.card,
          {
            width: size.width,
            height: size.height,
            borderRadius: size.radius,
            backgroundColor: card.isWild ? colors.wildFace : colors.cardFace,
            borderColor: card.isWild ? colors.wildAccent : colors.cardBorder,
            opacity: disabled ? 0.45 : 1,
          },
        ]}
      >
        {/* Top-left point value */}
        <Text
          style={[
            styles.points,
            typography.cardValue,
            {
              color: card.isWild ? colors.wildAccent : colors.inkMuted,
              fontSize: variant === 'board' ? 9 : 11,
            },
          ]}
        >
          {pointsText}
        </Text>

        {/* Center letter */}
        <View style={styles.letterContainer}>
          <Text
            style={[
              typography.cardLetter,
              {
                fontSize: variant === 'board' ? 28 : 36,
                color: card.isWild ? colors.wildAccent : colors.ink,
                fontStyle: card.isWild && !card.assignedLetter ? 'italic' : 'normal',
              },
            ]}
          >
            {displayLetter}
          </Text>
        </View>

        {/* Bottom-right point value (inverted) */}
        <Text
          style={[
            styles.pointsBottom,
            typography.cardValue,
            {
              color: card.isWild ? colors.wildAccent : colors.inkMuted,
              fontSize: variant === 'board' ? 9 : 11,
            },
          ]}
        >
          {pointsText}
        </Text>

        {/* subtle inner border */}
        <View
          pointerEvents="none"
          style={[
            styles.innerBorder,
            {
              borderRadius: size.radius - 2,
              borderColor: card.isWild ? 'rgba(184, 134, 11, 0.18)' : 'rgba(26, 24, 20, 0.06)',
            },
          ]}
        />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.accent,
    opacity: 0,
  },
  card: {
    borderWidth: 1,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  letterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  points: {
    position: 'absolute',
    top: 4,
    left: 6,
  },
  pointsBottom: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    transform: [{ rotate: '180deg' }],
  },
  innerBorder: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderWidth: 1,
  },
});
