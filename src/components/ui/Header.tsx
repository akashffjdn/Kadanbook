import { ChevronLeft } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onBack?: () => void;
  large?: boolean;
}

/**
 * Standard nav header. When `onBack` is provided, shows a chevron.
 * `large` switches to a CRED-style oversized title style.
 */
export const Header = memo<HeaderProps>(({ title, subtitle, leading, trailing, onBack, large }) => {
  const { styles, theme } = useStyles(stylesheet);
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.back, pressed && { opacity: 0.5 }]}
            >
              <ChevronLeft size={26} color={theme.colors.text.primary} />
            </Pressable>
          ) : (
            leading
          )}
        </View>
        <View style={styles.center}>
          {!large && title ? (
            <Text variant="subtitle" weight="semibold" numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {!large && subtitle ? (
            <Text variant="caption" color="secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.side}>{trailing}</View>
      </View>
      {large && (title || subtitle) ? (
        <View style={styles.largeWrap}>
          {title ? (
            <Text variant="title" weight="bold">
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="body" color="secondary" style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});
Header.displayName = 'Header';

const stylesheet = createStyleSheet((theme) => ({
  wrap: {
    paddingHorizontal: theme.spacing.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  side: { minWidth: 40, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start' },
  center: { flex: 1, alignItems: 'center' },
  back: { padding: 4 },
  largeWrap: { paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.md },
}));
