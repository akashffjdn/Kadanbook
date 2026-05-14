import { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

export interface ProgressBarProps {
  value: number; // 0..1
  height?: number;
  duration?: number;
  color?: string;
  backgroundColor?: string;
}

export const ProgressBar = memo<ProgressBarProps>(
  ({ value, height = 6, duration = 400, color, backgroundColor }) => {
    const { styles, theme } = useStyles(stylesheet);
    const progress = useSharedValue(0);

    useEffect(() => {
      progress.value = withTiming(Math.max(0, Math.min(1, value)), {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, [value, duration, progress]);

    const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

    return (
      <View
        style={[
          styles.track,
          { height, backgroundColor: backgroundColor ?? theme.colors.bg.elevated },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            { height, backgroundColor: color ?? theme.colors.brand.primary },
            fillStyle,
          ]}
        />
      </View>
    );
  },
);
ProgressBar.displayName = 'ProgressBar';

const stylesheet = createStyleSheet((theme) => ({
  track: {
    width: '100%',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: theme.radius.full,
  },
}));
