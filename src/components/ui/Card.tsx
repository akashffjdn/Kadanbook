import { memo } from 'react';
import { Pressable, type PressableProps, View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type CardVariant = 'flat' | 'elevated' | 'glow' | 'gradient';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: PressableProps['onPress'];
}

export const Card = memo<CardProps>(
  ({ variant = 'flat', padding = 'md', onPress, children, style, ...rest }) => {
    const { styles, theme } = useStyles(stylesheet, { variant, padding });
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    if (onPress) {
      return (
        <AnimatedPressable
          onPress={onPress}
          onPressIn={() => {
            scale.value = withSpring(0.98, theme.motion.spring.default);
          }}
          onPressOut={() => {
            scale.value = withSpring(1, theme.motion.spring.default);
          }}
          style={[styles.card, animStyle, style]}
          accessibilityRole="button"
        >
          {children}
        </AnimatedPressable>
      );
    }

    return (
      <View {...rest} style={[styles.card, style]}>
        {children}
      </View>
    );
  },
);
Card.displayName = 'Card';

const stylesheet = createStyleSheet((theme) => ({
  card: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    variants: {
      variant: {
        flat: {
          backgroundColor: theme.colors.bg.surface,
        },
        elevated: {
          backgroundColor: theme.colors.bg.elevated,
          shadowColor: '#000',
          shadowOpacity: theme.colors.isDark ? 0.4 : 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
        glow: {
          backgroundColor: theme.colors.bg.surface,
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
          shadowColor: theme.colors.brand.primary,
          shadowOpacity: 0.25,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 0 },
          elevation: 8,
        },
        gradient: {
          backgroundColor: theme.colors.brand.primary,
        },
      },
      padding: {
        none: { padding: 0 },
        sm: { padding: theme.spacing.md },
        md: { padding: theme.spacing.base },
        lg: { padding: theme.spacing.lg },
      },
    },
  },
}));
