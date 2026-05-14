import { useHaptic } from '@/hooks/useHaptic';
import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress: () => void;
  tint?: string;
}

/**
 * Quick action tile used on Home dashboard.
 * Apple Wallet shortcut style: rounded surface card, icon + label, scale press.
 */
export const QuickAction = memo<QuickActionProps>(({ icon, label, subtitle, onPress, tint }) => {
  const { styles, theme } = useStyles(stylesheet);
  const trigger = useHaptic();
  const s = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  const handlePress = useCallback(() => {
    trigger('light');
    onPress();
  }, [onPress, trigger]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      onPressIn={() => {
        s.value = withSpring(0.96, theme.motion.spring.default);
      }}
      onPressOut={() => {
        s.value = withSpring(1, theme.motion.spring.default);
      }}
      style={[styles.tile, animStyle]}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: tint ? `${tint}22` : theme.colors.brand.glow }]}
      >
        {icon}
      </View>
      <Text variant="body" weight="semibold" style={{ marginTop: theme.spacing.md }}>
        {label}
      </Text>
      {subtitle ? (
        <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
          {subtitle}
        </Text>
      ) : null}
    </AnimatedPressable>
  );
});
QuickAction.displayName = 'QuickAction';

const stylesheet = createStyleSheet((theme) => ({
  tile: {
    flex: 1,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.base,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
