import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Button } from './Button';
import { Text } from './Text';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = memo<ErrorStateProps>(
  ({ title = 'Something went wrong', description, onRetry, retryLabel = 'Retry' }) => {
    const { styles, theme } = useStyles(stylesheet);
    return (
      <View style={styles.wrap}>
        <View style={styles.iconWrap}>
          <AlertTriangle size={32} color={theme.colors.semantic.danger} />
        </View>
        <Text variant="title" weight="bold" align="center">
          {title}
        </Text>
        {description ? (
          <Text variant="body" color="secondary" align="center" style={styles.desc}>
            {description}
          </Text>
        ) : null}
        {onRetry ? (
          <View style={styles.actionWrap}>
            <Button
              label={retryLabel}
              onPress={onRetry}
              variant="secondary"
              leftIcon={<RefreshCw size={18} color={theme.colors.text.primary} />}
              fullWidth={false}
            />
          </View>
        ) : null}
      </View>
    );
  },
);
ErrorState.displayName = 'ErrorState';

const stylesheet = createStyleSheet((theme) => ({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing['2xl'],
    minHeight: 320,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.semantic.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  desc: { marginTop: theme.spacing.sm, maxWidth: 280, lineHeight: 20 },
  actionWrap: { marginTop: theme.spacing.xl },
}));
