import { useHaptic } from '@/hooks/useHaptic';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { memo, useCallback } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ChipProps {
  label: string;
  selected?: boolean;
  count?: number;
  leftIcon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * Filter / segment chip.
 *
 * Design refs:
 *  - CRED filters (compact 32dp pill, brand fill on active)
 *  - Cash App segmented filters (count rendered as a tiny inline badge)
 *  - Material 3 filter chip (subtle border, brand fill on selection)
 *
 * Sizing is explicit (minHeight 32, paddingVertical 0) so it never inflates
 * with line-height / font-padding. Counts render as a smaller inline pill
 * for clear separation.
 */
export const Chip = memo<ChipProps>(
  ({ label, selected = false, count, leftIcon, onPress, disabled }) => {
    const { styles, theme } = useStyles(stylesheet);
    const trigger = useHaptic();
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const handlePress = useCallback(() => {
      trigger('select');
      onPress?.();
    }, [onPress, trigger]);

    const labelColor = selected ? theme.colors.brand.onPrimary : theme.colors.text.primary;
    const countColor = selected ? theme.colors.brand.onPrimary : theme.colors.text.secondary;
    const countBg = selected
      ? 'rgba(255,255,255,0.22)'
      : theme.colors.bg.elevated;

    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.95, theme.motion.spring.default);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, theme.motion.spring.default);
        }}
        onPress={handlePress}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? theme.colors.brand.primary : theme.colors.bg.surface,
            borderColor: selected ? theme.colors.brand.primary : theme.colors.border.subtle,
          },
          animStyle,
          disabled ? { opacity: theme.opacity.disabled } : null,
        ]}
      >
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        <RNText
          numberOfLines={1}
          style={[styles.label, { color: labelColor }]}
        >
          {label}
        </RNText>
        {typeof count === 'number' ? (
          <View style={[styles.countPill, { backgroundColor: countBg }]}>
            <RNText style={[styles.countText, { color: countColor }]}>{count}</RNText>
          </View>
        ) : null}
      </AnimatedPressable>
    );
  },
);
Chip.displayName = 'Chip';

const stylesheet = createStyleSheet((theme) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 0,
    minHeight: 32,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: { alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    includeFontPadding: false,
  },
  countPill: {
    minWidth: 20,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
}));
