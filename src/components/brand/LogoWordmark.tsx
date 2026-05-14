import { View } from 'react-native';
import { Text } from '@/components/ui';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { LogoMark } from './LogoMark';

/**
 * KadanBook horizontal lockup: mark + wordmark.
 *
 * Design refs:
 *  - Stripe / Linear (wordmark sits in vertical optical center of the mark)
 *  - Cash App (tight letter-spacing on the wordmark)
 *
 * Three sizes — sm (header), md (default), lg (splash / marketing).
 */
export type LogoWordmarkProps = {
  size?: 'sm' | 'md' | 'lg';
  /** Show a Tamil/English tagline beneath the wordmark */
  tagline?: string;
  /** Stack vertically (mark on top, wordmark below). Default horizontal. */
  stacked?: boolean;
};

const SIZE_MAP = {
  sm: { mark: 28, title: 16, tagline: 11, gap: 8, radius: 0.28 },
  md: { mark: 40, title: 22, tagline: 12, gap: 10, radius: 0.26 },
  lg: { mark: 96, title: 36, tagline: 14, gap: 16, radius: 0.26 },
} as const;

export function LogoWordmark({ size = 'md', tagline, stacked = false }: LogoWordmarkProps) {
  const { styles } = useStyles(stylesheet);
  const dims = SIZE_MAP[size];

  return (
    <View
      style={[
        styles.row,
        stacked && styles.stacked,
        { gap: stacked ? dims.gap : dims.gap * 1.2 },
      ]}
    >
      <LogoMark size={dims.mark} radiusRatio={dims.radius} />
      <View style={stacked ? styles.centerText : undefined}>
        <Text
          variant="title"
          weight="bold"
          style={{
            fontSize: dims.title,
            lineHeight: dims.title * 1.1,
            letterSpacing: -0.4,
          }}
        >
          KadanBook
        </Text>
        {tagline ? (
          <Text
            variant="caption"
            color="secondary"
            style={{
              fontSize: dims.tagline,
              marginTop: stacked ? 6 : 2,
              letterSpacing: 0.1,
            }}
            align={stacked ? 'center' : 'left'}
          >
            {tagline}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stacked: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  centerText: {
    alignItems: 'center',
  },
}));
