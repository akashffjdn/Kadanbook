import { useHaptic } from '@/hooks/useHaptic';
import { memo, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export interface Segment {
  id: string;
  label: string;
}

export interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (id: string) => void;
}

export const SegmentedControl = memo<SegmentedControlProps>(({ segments, value, onChange }) => {
  const { styles, theme } = useStyles(stylesheet);
  const trigger = useHaptic();
  const [width, setWidth] = useState(0);

  const segWidth = width / segments.length;
  const idx = segments.findIndex((s) => s.id === value);
  const translate = useSharedValue(0);

  useEffect(() => {
    if (segWidth) {
      translate.value = withSpring(idx * segWidth, theme.motion.spring.default);
    }
  }, [idx, segWidth, theme, translate]);

  const indicator = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value }],
    width: segWidth,
  }));

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.track} onLayout={handleLayout}>
      <Animated.View style={[styles.indicator, indicator]} />
      {segments.map((s) => (
        <Pressable
          key={s.id}
          onPress={() => {
            trigger('select');
            onChange(s.id);
          }}
          style={styles.seg}
        >
          <Text
            variant="body"
            weight={s.id === value ? 'semibold' : 'medium'}
            color={s.id === value ? 'primary' : 'secondary'}
          >
            {s.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
});
SegmentedControl.displayName = 'SegmentedControl';

const stylesheet = createStyleSheet((theme) => ({
  track: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bg.elevated,
    borderRadius: theme.radius.base,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
}));
