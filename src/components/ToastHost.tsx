import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  FadeOut,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { colors, typography, spacing, radius } from '../theme';

export const ToastHost: React.FC = () => {
  const toasts = useGameStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <View style={styles.host} pointerEvents="none">
      {toasts.map((t) => (
        <Animated.View
          key={t.id}
          entering={SlideInDown.springify().damping(16).stiffness(180)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.toast,
            {
              backgroundColor:
                t.kind === 'error'
                  ? colors.accent
                  : t.kind === 'success'
                  ? colors.success
                  : colors.ink,
            },
          ]}
        >
          <Text style={[typography.bodyMedium, styles.text]}>{t.text}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    zIndex: 200,
  },
  toast: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  text: {
    color: colors.paper,
    textAlign: 'center',
  },
});
