import { memo, useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export const Skeleton = memo<SkeletonProps>(({ width = '100%', height = 16, radius, style }) => {
  const { styles, theme } = useStyles(stylesheet);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.bone,
        { width: width as ViewStyle['width'], height, borderRadius: radius ?? theme.radius.sm },
        animStyle,
        style,
      ]}
    />
  );
});
Skeleton.displayName = 'Skeleton';

export const CustomerRowSkeleton = memo(() => {
  const { theme } = useStyles(stylesheet);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.base,
      }}
    >
      <Skeleton width={44} height={44} radius={22} />
      <View style={{ flex: 1, gap: theme.spacing.sm }}>
        <Skeleton width={'60%'} height={14} />
        <Skeleton width={'40%'} height={12} />
      </View>
      <View style={{ gap: theme.spacing.sm, alignItems: 'flex-end' }}>
        <Skeleton width={70} height={16} />
        <Skeleton width={50} height={12} radius={10} />
      </View>
    </View>
  );
});
CustomerRowSkeleton.displayName = 'CustomerRowSkeleton';

export const CardSkeleton = memo<{ height?: number }>(({ height = 120 }) => (
  <Skeleton width="100%" height={height} radius={16} />
));
CardSkeleton.displayName = 'CardSkeleton';

const stylesheet = createStyleSheet((theme) => ({
  bone: {
    backgroundColor: theme.colors.bg.elevated,
  },
}));
