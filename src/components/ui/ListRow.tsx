import { ChevronRight } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  accentColor?: string;
}

/** Generic settings/list row used throughout the app. */
export const ListRow = memo<ListRowProps>(
  ({ title, subtitle, leftIcon, rightContent, showChevron, onPress, destructive, accentColor }) => {
    const { styles, theme } = useStyles(stylesheet);
    const content = (
      <View style={styles.row}>
        {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
        {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
        <View style={styles.body}>
          <Text
            variant="bodyLarge"
            weight="semibold"
            color={destructive ? 'danger' : 'primary'}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color="secondary" numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightContent ? <View style={styles.right}>{rightContent}</View> : null}
        {showChevron ? (
          <ChevronRight size={20} color={theme.colors.text.muted} style={{ marginLeft: 4 }} />
        ) : null}
      </View>
    );
    if (onPress) {
      return (
        <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
          {content}
        </Pressable>
      );
    }
    return content;
  },
);
ListRow.displayName = 'ListRow';

const stylesheet = createStyleSheet((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    minHeight: 56,
    backgroundColor: theme.colors.bg.surface,
  },
  accent: { width: 3, alignSelf: 'stretch', borderRadius: 2, marginRight: theme.spacing.md },
  iconWrap: { marginRight: theme.spacing.md },
  body: { flex: 1 },
  subtitle: { marginTop: 2 },
  right: { marginLeft: theme.spacing.sm },
}));
