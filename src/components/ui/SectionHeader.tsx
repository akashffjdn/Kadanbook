import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader = memo<SectionHeaderProps>(({ title, actionLabel, onAction }) => {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={styles.row}>
      <Text variant="label" color="secondary">
        {title}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text variant="body" weight="semibold" color="brand">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
});
SectionHeader.displayName = 'SectionHeader';

const stylesheet = createStyleSheet((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
}));
