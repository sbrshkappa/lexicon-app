import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../theme';
import { Button } from './Button';

export interface HandoffOverlayProps {
  visible: boolean;
  nextPlayerName: string;
  onContinue: () => void;
}

export const HandoffOverlay: React.FC<HandoffOverlayProps> = ({
  visible,
  nextPlayerName,
  onContinue,
}) => {
  const breath = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      breath.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1600 }),
          withTiming(0, { duration: 1600 }),
        ),
        -1,
        false,
      );
    } else {
      breath.value = 0;
    }
  }, [visible, breath]);

  const breathStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + breath.value * 0.5,
    transform: [{ scale: 1 + breath.value * 0.04 }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      entering={FadeIn.duration(280)}
      exiting={FadeOut.duration(240)}
      style={styles.overlay}
    >
      <View style={styles.card}>
        <Text style={[typography.overline, { color: colors.inkMuted }]}>Pass the device</Text>

        <Animated.View style={[styles.bigLetter, breathStyle]}>
          <Text style={styles.letterText}>
            {nextPlayerName.charAt(0).toUpperCase()}
          </Text>
        </Animated.View>

        <Text style={[typography.h1, styles.nameText]} numberOfLines={1}>
          {nextPlayerName}
        </Text>
        <Text style={[typography.body, { color: colors.inkMuted, textAlign: 'center' }]}>
          it's your turn.{'\n'}Tap below when you're ready to see your hand.
        </Text>

        <View style={{ height: spacing.xl }} />

        <Button
          label="I'm ready"
          variant="primary"
          size="lg"
          fullWidth
          onPress={onContinue}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  bigLetter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  letterText: {
    ...typography.display,
    fontSize: 86,
    color: colors.paper,
  },
  nameText: {
    color: colors.ink,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
