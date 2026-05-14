import { Check } from 'lucide-react-native';
import { memo, useEffect } from 'react';
import { Modal, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Button } from './Button';
import { Text } from './Text';

export interface SuccessOverlayProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  autoDismissMs?: number;
  onAutoDismiss?: () => void;
}

/**
 * Full-screen Stripe-tier success animation. Used after collect-payment / save-kadan.
 * Green burst circle, spring-scaled checkmark, optional confetti.
 */
export const SuccessOverlay = memo<SuccessOverlayProps>(
  ({
    visible,
    title,
    subtitle,
    primaryActionLabel,
    onPrimaryAction,
    secondaryActionLabel,
    onSecondaryAction,
    autoDismissMs,
    onAutoDismiss,
  }) => {
    const { styles, theme } = useStyles(stylesheet);
    const circleScale = useSharedValue(0);
    const checkScale = useSharedValue(0);
    const titleY = useSharedValue(20);
    const titleOpacity = useSharedValue(0);

    useEffect(() => {
      if (!visible) {
        circleScale.value = 0;
        checkScale.value = 0;
        titleY.value = 20;
        titleOpacity.value = 0;
        return;
      }
      circleScale.value = withSpring(1, { damping: 12, stiffness: 240 });
      checkScale.value = withDelay(180, withSpring(1, { damping: 10, stiffness: 280 }));
      titleY.value = withDelay(280, withSpring(0, { damping: 18, stiffness: 220 }));
      titleOpacity.value = withDelay(
        280,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
      );

      if (autoDismissMs && onAutoDismiss) {
        const timer = setTimeout(onAutoDismiss, autoDismissMs);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [visible, autoDismissMs, onAutoDismiss, circleScale, checkScale, titleY, titleOpacity]);

    const circleStyle = useAnimatedStyle(() => ({
      transform: [{ scale: circleScale.value }],
    }));
    const checkStyle = useAnimatedStyle(() => ({
      transform: [{ scale: checkScale.value }],
      opacity: checkScale.value,
    }));
    const titleStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: titleY.value }],
      opacity: titleOpacity.value,
    }));

    return (
      <Modal visible={visible} transparent animationType="none">
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(180)}
          style={styles.backdrop}
        >
          <View style={styles.content}>
            <Animated.View style={[styles.circle, circleStyle]}>
              <Animated.View style={checkStyle}>
                <Check size={64} color={theme.colors.text.onBrand} strokeWidth={3} />
              </Animated.View>
            </Animated.View>
            <Animated.View
              style={[{ alignItems: 'center', marginTop: theme.spacing.xl }, titleStyle]}
            >
              <Text variant="title" weight="bold" align="center">
                {title}
              </Text>
              {subtitle ? (
                <Text
                  variant="bodyLarge"
                  color="secondary"
                  align="center"
                  style={{ marginTop: theme.spacing.sm, maxWidth: 280 }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </Animated.View>
            {primaryActionLabel || secondaryActionLabel ? (
              <View style={styles.actions}>
                {primaryActionLabel && onPrimaryAction ? (
                  <Button label={primaryActionLabel} onPress={onPrimaryAction} />
                ) : null}
                {secondaryActionLabel && onSecondaryAction ? (
                  <View style={{ marginTop: theme.spacing.sm }}>
                    <Button
                      label={secondaryActionLabel}
                      variant="ghost"
                      onPress={onSecondaryAction}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </Animated.View>
      </Modal>
    );
  },
);
SuccessOverlay.displayName = 'SuccessOverlay';

const stylesheet = createStyleSheet((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.bg.base,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing['2xl'],
  },
  content: { alignItems: 'center', width: '100%' },
  circle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: theme.colors.semantic.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.semantic.success,
    shadowOpacity: 0.4,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  actions: { marginTop: theme.spacing['2xl'], width: '100%' },
}));
