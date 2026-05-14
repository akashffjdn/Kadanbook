import { useHaptic } from '@/hooks/useHaptic';
import { Delete } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface NumPadProps {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
}

const KEYS: Array<{ label: string; type: 'digit' | 'op'; value?: string }> = [
  { label: '1', type: 'digit', value: '1' },
  { label: '2', type: 'digit', value: '2' },
  { label: '3', type: 'digit', value: '3' },
  { label: '4', type: 'digit', value: '4' },
  { label: '5', type: 'digit', value: '5' },
  { label: '6', type: 'digit', value: '6' },
  { label: '7', type: 'digit', value: '7' },
  { label: '8', type: 'digit', value: '8' },
  { label: '9', type: 'digit', value: '9' },
  { label: '00', type: 'digit', value: '00' },
  { label: '0', type: 'digit', value: '0' },
  { label: '⌫', type: 'op' },
];

const Key = memo<{
  label: string;
  isOp?: boolean;
  onPress: () => void;
}>(({ label, isOp, onPress }) => {
  const { styles, theme } = useStyles(stylesheet);
  const trigger = useHaptic();
  const s = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        s.value = withSpring(0.92, theme.motion.spring.default);
      }}
      onPressOut={() => {
        s.value = withSpring(1, theme.motion.spring.default);
      }}
      onPress={() => {
        trigger('light');
        onPress();
      }}
      style={[styles.key, animStyle]}
    >
      {isOp ? (
        <Delete size={26} color={theme.colors.text.primary} />
      ) : (
        <Text style={styles.keyText}>{label}</Text>
      )}
    </AnimatedPressable>
  );
});
Key.displayName = 'Key';

export const NumPad = memo<NumPadProps>(({ onDigit, onBackspace }) => {
  const { styles } = useStyles(stylesheet);
  const handlePress = useCallback(
    (k: (typeof KEYS)[number]) => {
      if (k.type === 'digit' && k.value) onDigit(k.value);
      else onBackspace();
    },
    [onDigit, onBackspace],
  );

  return (
    <View style={styles.grid}>
      {KEYS.map((k) => (
        <Key key={k.label} label={k.label} isOp={k.type === 'op'} onPress={() => handlePress(k)} />
      ))}
    </View>
  );
});
NumPad.displayName = 'NumPad';

const stylesheet = createStyleSheet((theme) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.sm,
  },
  key: {
    width: '33.333%',
    aspectRatio: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
}));
