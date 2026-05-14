import { formatINRPlain } from '@/utils/currency';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { memo, useEffect } from 'react';
import { Text as RNText, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Text } from './Text';

export interface AmountInputProps {
  value: number;
  size?: 'lg' | 'xl' | '2xl';
  prefix?: string;
  caption?: string;
}

const SIZES = {
  lg: { symbol: 26, amount: 40, lineHeight: 48, cursor: 36 },
  xl: { symbol: 32, amount: 52, lineHeight: 60, cursor: 46 },
  '2xl': { symbol: 38, amount: 60, lineHeight: 68, cursor: 52 },
} as const;

/**
 * Display-only amount renderer with a blinking cursor.
 *
 * Design refs:
 *  - Cash App $balance hero (oversized number, blinking cursor as input cue)
 *  - Splitwise enter-amount (centered, breathing room)
 *
 * Sizing is explicit (no Unistyles variants) so Android `includeFontPadding`
 * can't squash the glyph and the cursor has reliable height. Row is
 * `alignItems: center` (not baseline) so the cursor View aligns visually
 * even though it has no text baseline.
 */
export const AmountInput = memo<AmountInputProps>(
  ({ value, size = '2xl', prefix = '₹', caption }) => {
    const { styles, theme } = useStyles(stylesheet);
    const dims = SIZES[size];
    const cursor = useSharedValue(1);

    useEffect(() => {
      cursor.value = withRepeat(
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }, [cursor]);

    const cursorStyle = useAnimatedStyle(() => ({ opacity: cursor.value }));

    return (
      <View style={styles.wrap}>
        <View style={[styles.row, { minHeight: dims.lineHeight }]}>
          <RNText
            allowFontScaling={false}
            style={{
              fontSize: dims.symbol,
              lineHeight: dims.lineHeight,
              fontWeight: '600',
              color: theme.colors.text.muted,
              includeFontPadding: false,
            }}
          >
            {prefix}
          </RNText>
          <RNText
            allowFontScaling={false}
            style={{
              fontSize: dims.amount,
              lineHeight: dims.lineHeight,
              fontWeight: '700',
              color: theme.colors.text.primary,
              includeFontPadding: false,
              fontVariant: ['tabular-nums'],
              letterSpacing: -1,
            }}
          >
            {formatINRPlain(value)}
          </RNText>
          <Animated.View
            style={[
              styles.cursor,
              {
                height: dims.cursor,
                backgroundColor: theme.colors.brand.primary,
              },
              cursorStyle,
            ]}
          />
        </View>
        {caption ? (
          <Text variant="body" color="secondary" align="center" style={styles.caption}>
            {caption}
          </Text>
        ) : null}
      </View>
    );
  },
);
AmountInput.displayName = 'AmountInput';

const stylesheet = createStyleSheet((theme) => ({
  wrap: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cursor: {
    width: 2.5,
    borderRadius: 1.5,
    marginLeft: 4,
  },
  caption: { marginTop: theme.spacing.md },
}));
