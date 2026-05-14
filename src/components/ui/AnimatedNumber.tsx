import { memo, useEffect } from 'react';
import { type StyleProp, TextInput, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
Animated.addWhitelistedNativeProps({ text: true });

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  withSymbol?: boolean;
  style?: StyleProp<TextStyle>;
  prefix?: string;
}

/**
 * Worklet-safe Indian-grouping number formatter.
 * Implemented inline because `Intl.NumberFormat` isn't available on the
 * Reanimated UI thread. Mirrors `formatINR` from utils/currency.ts
 * (1,23,456 — first 3 digits, then every 2).
 */
const formatINRWorklet = (n: number, symbol: string): string => {
  'worklet';
  const abs = Math.round(Math.abs(n));
  const s = String(abs);
  let body: string;
  if (s.length <= 3) {
    body = s;
  } else {
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    let grouped = '';
    for (let i = rest.length; i > 0; i -= 2) {
      const start = i - 2 < 0 ? 0 : i - 2;
      const chunk = rest.slice(start, i);
      grouped = grouped ? `${chunk},${grouped}` : chunk;
    }
    body = `${grouped},${last3}`;
  }
  return n < 0 ? `-${symbol}${body}` : `${symbol}${body}`;
};

/**
 * Animates a numeric value count-up. Uses a native-driver TextInput
 * to update text from the UI thread (60fps even under load).
 *
 * Inspired by Cash App balance and Stripe dashboard hero numbers.
 */
export const AnimatedNumber = memo<AnimatedNumberProps>(
  ({ value, duration = 600, withSymbol = true, style, prefix = '' }) => {
    const progress = useSharedValue(value);

    useEffect(() => {
      progress.value = withTiming(value, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, [value, duration, progress]);

    const animatedProps = useAnimatedProps(() => {
      const v = Math.round(progress.value);
      const symbol = withSymbol ? '₹' : '';
      const text = `${prefix}${formatINRWorklet(v, symbol)}`;
      return { text, defaultValue: text };
    });

    return (
      <AnimatedTextInput
        editable={false}
        underlineColorAndroid="transparent"
        style={style}
        animatedProps={animatedProps}
      />
    );
  },
);
AnimatedNumber.displayName = 'AnimatedNumber';
