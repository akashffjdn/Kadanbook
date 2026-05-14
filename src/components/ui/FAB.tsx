import { useHaptic } from '@/hooks/useHaptic';
import { memo, useCallback, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface FABProps {
  icon: React.ReactNode;
  onPress: () => void;
  label?: string;
  hidden?: boolean;
  bottom?: number;
}

/**
 * Floating action button — bottom-right, hides on scroll down, reveals on scroll up.
 * Material-style hide/show via translateY+opacity.
 */
export const FAB = memo<FABProps>(({ icon, onPress, label, hidden, bottom = 96 }) => {
  const { styles, theme } = useStyles(stylesheet);
  const trigger = useHaptic();
  const press = useSharedValue(1);
  const hide = useSharedValue(0);

  useEffect(() => {
    hide.value = withSpring(hidden ? 1 : 0, theme.motion.spring.default);
  }, [hidden, hide, theme]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }, { translateY: hide.value * 100 }],
    opacity: 1 - hide.value * 0.4,
  }));

  const handlePress = useCallback(() => {
    trigger('medium');
    onPress();
  }, [onPress, trigger]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        press.value = withSpring(0.92, theme.motion.spring.default);
      }}
      onPressOut={() => {
        press.value = withSpring(1, theme.motion.spring.default);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.fab, { bottom }, animStyle]}
    >
      {icon}
    </AnimatedPressable>
  );
});
FAB.displayName = 'FAB';

const stylesheet = createStyleSheet((theme) => ({
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.brand.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
}));
