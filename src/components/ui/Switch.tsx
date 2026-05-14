import { useHaptic } from '@/hooks/useHaptic';
import { memo, useCallback, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

const TRACK_W = 50;
const TRACK_H = 28;
const THUMB = 22;
const PAD = 3;

export interface SwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

export const Switch = memo<SwitchProps>(({ value, onValueChange, disabled }) => {
  const { styles, theme } = useStyles(stylesheet);
  const trigger = useHaptic();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 220 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.bg.elevated, theme.colors.brand.primary],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(
          progress.value * (TRACK_W - THUMB - PAD * 2),
          theme.motion.spring.default,
        ),
      },
    ],
  }));

  const handlePress = useCallback(() => {
    trigger('select');
    onValueChange(!value);
  }, [onValueChange, value, trigger]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={disabled ? { opacity: theme.opacity.disabled } : null}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <View style={styles.thumbInner} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});
Switch.displayName = 'Switch';

const stylesheet = createStyleSheet((_theme) => ({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    padding: PAD,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: { width: 0, height: 0 },
}));
