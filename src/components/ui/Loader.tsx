import { memo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export interface LoaderProps {
  variant?: 'inline' | 'full';
  label?: string;
  size?: 'small' | 'large';
}

export const Loader = memo<LoaderProps>(({ variant = 'inline', label, size = 'large' }) => {
  const { styles, theme } = useStyles(stylesheet, { variant });
  return (
    <View style={styles.box}>
      <ActivityIndicator size={size} color={theme.colors.brand.primary} />
      {label ? (
        <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.md }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
});
Loader.displayName = 'Loader';

const stylesheet = createStyleSheet((theme) => ({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      variant: {
        inline: { padding: theme.spacing.lg },
        full: {
          flex: 1,
          backgroundColor: theme.colors.bg.base,
          padding: theme.spacing['3xl'],
        },
      },
    },
  },
}));
