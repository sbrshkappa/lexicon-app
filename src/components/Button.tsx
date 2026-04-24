import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, radius, springs } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    opacity: 1 - pressed.value * 0.05,
  }));

  const variantStyles = getVariantStyles(variant, disabled);
  const sizeStyles = getSizeStyles(size);

  return (
    <Animated.View style={[fullWidth && { alignSelf: 'stretch' }, animatedStyle, style]}>
      <Pressable
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={() => (pressed.value = withTiming(1, { duration: 80 }))}
        onPressOut={() => (pressed.value = withSpring(0, springs.snappy))}
        style={[
          styles.base,
          { ...sizeStyles.container, ...variantStyles.container },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyles.text.color as string}
          />
        ) : (
          <Text
            style={[
              typography.button,
              { fontSize: sizeStyles.text.fontSize },
              variantStyles.text,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const getVariantStyles = (
  variant: Variant,
  disabled: boolean,
): { container: ViewStyle; text: any } => {
  const alpha = disabled ? 0.4 : 1;
  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: colors.ink,
          opacity: alpha,
        },
        text: { color: colors.paper },
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.paperDeep,
          borderWidth: 1,
          borderColor: colors.paperEdge,
          opacity: alpha,
        },
        text: { color: colors.ink },
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          opacity: alpha,
        },
        text: { color: colors.ink },
      };
    case 'danger':
      return {
        container: {
          backgroundColor: colors.accent,
          opacity: alpha,
        },
        text: { color: colors.paper },
      };
  }
};

const getSizeStyles = (
  size: Size,
): { container: ViewStyle; text: { fontSize: number } } => {
  switch (size) {
    case 'sm':
      return {
        container: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.sm },
        text: { fontSize: 13 },
      };
    case 'md':
      return {
        container: { paddingHorizontal: 20, paddingVertical: 13, borderRadius: radius.md },
        text: { fontSize: 15 },
      };
    case 'lg':
      return {
        container: { paddingHorizontal: 28, paddingVertical: 17, borderRadius: radius.md },
        text: { fontSize: 16 },
      };
  }
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
