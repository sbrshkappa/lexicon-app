import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Player } from '../game/types';
import { colors, typography, radius, spacing, springs } from '../theme';

export interface PlayerBarProps {
  player: Player;
  active: boolean;
  cardsInHand: number;
  compact?: boolean;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  player,
  active,
  cardsInHand,
  compact = false,
}) => {
  const activeAnim = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    activeAnim.value = withSpring(active ? 1 : 0, springs.soft);
  }, [active, activeAnim]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: active ? colors.ink : colors.paperDeep,
    borderColor: active ? colors.ink : colors.paperEdge,
  }));

  const nameStyle = useAnimatedStyle(() => ({
    color: active ? colors.paper : colors.ink,
  }));

  const subStyle = useAnimatedStyle(() => ({
    color: active ? 'rgba(250, 247, 242, 0.72)' : colors.inkMuted,
  }));

  return (
    <Animated.View style={[styles.container, compact && styles.compact, containerStyle]}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={[typography.h3, { color: active ? colors.paper : colors.ink }]}>
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ marginLeft: spacing.md }}>
          <Animated.Text style={[typography.h3, nameStyle]} numberOfLines={1}>
            {player.name}
          </Animated.Text>
          <Animated.Text style={[typography.small, subStyle]}>
            {cardsInHand} {cardsInHand === 1 ? 'card' : 'cards'} in hand
          </Animated.Text>
        </View>
      </View>
      <View style={styles.right}>
        <Animated.Text style={[typography.overline, subStyle]}>Penalty</Animated.Text>
        <Animated.Text style={[typography.h2, nameStyle]}>{player.score}</Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  compact: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(26,24,20,0.12)',
  },
  right: {
    alignItems: 'flex-end',
  },
});
