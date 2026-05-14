import { type HapticType, useHaptic } from '@/hooks/useHaptic';
import { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'flat' | 'tinted' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  haptic?: HapticType;
  badge?: boolean;
  accessibilityLabel?: string;
}

const SIZE: Record<NonNullable<IconButtonProps['size']>, number> = { sm: 36, md: 44, lg: 56 };

export const IconButton = memo<IconButtonProps>(
  ({
    icon,
    onPress,
    variant = 'flat',
    size = 'md',
    haptic = 'light',
    badge,
    accessibilityLabel,
  }) => {
    const { styles, theme } = useStyles(stylesheet, { variant });
    const trigger = useHaptic();
    const s = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

    const handlePress = useCallback(() => {
      trigger(haptic);
      onPress();
    }, [haptic, onPress, trigger]);

    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={handlePress}
        onPressIn={() => {
          s.value = withSpring(0.9, theme.motion.spring.default);
        }}
        onPressOut={() => {
          s.value = withSpring(1, theme.motion.spring.default);
        }}
        style={[
          styles.btn,
          { width: SIZE[size], height: SIZE[size], borderRadius: SIZE[size] / 2 },
          animStyle,
        ]}
      >
        {icon}
        {badge ? <Animated.View style={styles.badge} /> : null}
      </AnimatedPressable>
    );
  },
);
IconButton.displayName = 'IconButton';

const stylesheet = createStyleSheet((theme) => ({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      variant: {
        flat: { backgroundColor: 'transparent' },
        tinted: { backgroundColor: theme.colors.bg.elevated },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
        },
      },
    },
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.semantic.danger,
  },
}));
