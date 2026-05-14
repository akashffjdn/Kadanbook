import { type HapticType, useHaptic } from '@/hooks/useHaptic';
import { memo, useCallback } from 'react';
import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: HapticType | false;
}

export const Button = memo<ButtonProps>(
  ({
    label,
    variant = 'primary',
    size = 'lg',
    loading = false,
    fullWidth = true,
    leftIcon,
    rightIcon,
    haptic = 'light',
    onPress,
    disabled,
    ...rest
  }) => {
    const { styles, theme } = useStyles(stylesheet, { variant, size });
    const trigger = useHaptic();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.96, theme.motion.spring.default);
      opacity.value = withTiming(0.92, { duration: 100 });
    }, [scale, opacity, theme]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, theme.motion.spring.default);
      opacity.value = withTiming(1, { duration: 150 });
    }, [scale, opacity, theme]);

    const handlePress = useCallback(
      (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
        if (haptic) trigger(haptic);
        onPress?.(e);
      },
      [haptic, onPress, trigger],
    );

    const isDisabled = disabled || loading;
    const textColor =
      variant === 'primary' || variant === 'danger'
        ? 'onBrand'
        : variant === 'secondary' || variant === 'ghost'
          ? 'primary'
          : 'brand';

    return (
      <AnimatedPressable
        {...rest}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.container,
          fullWidth ? styles.fullWidth : styles.autoWidth,
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.text.onBrand} />
        ) : (
          <View style={styles.row}>
            {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
            <Text
              variant={size === 'sm' ? 'body' : 'bodyLarge'}
              weight="semibold"
              color={textColor}
            >
              {label}
            </Text>
            {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
          </View>
        )}
      </AnimatedPressable>
    );
  },
);
Button.displayName = 'Button';

const stylesheet = createStyleSheet((theme) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.base,
    flexDirection: 'row',
    variants: {
      variant: {
        primary: {
          backgroundColor: theme.colors.brand.primary,
          shadowColor: theme.colors.brand.primary,
          shadowOpacity: 0.3,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
        secondary: {
          backgroundColor: theme.colors.bg.elevated,
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
        },
        ghost: {
          backgroundColor: 'transparent',
        },
        danger: {
          backgroundColor: theme.colors.semantic.danger,
        },
        link: {
          backgroundColor: 'transparent',
          paddingHorizontal: 0,
        },
      },
      size: {
        sm: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.base,
          minHeight: 36,
        },
        md: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          minHeight: 44,
        },
        lg: {
          paddingVertical: theme.spacing.base,
          paddingHorizontal: theme.spacing.xl,
          minHeight: theme.touchTarget.min,
        },
        xl: {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          minHeight: theme.touchTarget.primary,
        },
      },
    },
  },
  fullWidth: { width: '100%' },
  autoWidth: { alignSelf: 'flex-start' },
  disabled: { opacity: theme.opacity.disabled },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  icon: { alignItems: 'center', justifyContent: 'center' },
}));
