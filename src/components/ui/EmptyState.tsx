import { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export const EmptyState = memo<EmptyStateProps>(
  ({ icon, title, description, actionLabel, onAction, compact }) => {
    const { styles } = useStyles(stylesheet, { compact: compact ? 'on' : 'off' });
    return (
      <View style={styles.wrap}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text variant="title" weight="bold" align="center">
          {title}
        </Text>
        {description ? (
          <Text variant="body" color="secondary" align="center" style={styles.desc}>
            {description}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <View style={styles.actionWrap}>
            <Button label={actionLabel} onPress={onAction} fullWidth={false} size="lg" />
          </View>
        ) : null}
      </View>
    );
  },
);
EmptyState.displayName = 'EmptyState';

const stylesheet = createStyleSheet((theme) => ({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      compact: {
        on: { padding: theme.spacing.lg },
        off: { padding: theme.spacing['2xl'], minHeight: 320 },
      },
    },
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  desc: {
    marginTop: theme.spacing.sm,
    maxWidth: 280,
    lineHeight: 20,
  },
  actionWrap: { marginTop: theme.spacing.xl },
}));
