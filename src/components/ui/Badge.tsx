import { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export type BadgeStatus = 'pending' | 'paid' | 'overdue' | 'info' | 'new' | 'brand' | 'muted';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  status?: BadgeStatus;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge = memo<BadgeProps>(({ label, status = 'muted', size = 'md', dot }) => {
  const { styles, theme } = useStyles(stylesheet, { status, size });
  const colorFor = (s: BadgeStatus) => {
    switch (s) {
      case 'pending':
        return theme.colors.status.pending;
      case 'paid':
        return theme.colors.status.paid;
      case 'overdue':
        return theme.colors.status.overdue;
      case 'info':
        return theme.colors.semantic.info;
      case 'new':
      case 'brand':
        return theme.colors.brand.primary;
      default:
        return theme.colors.text.secondary;
    }
  };
  return (
    <View style={styles.badge}>
      {dot ? <View style={[styles.dot, { backgroundColor: colorFor(status) }]} /> : null}
      <Text
        variant="label"
        weight="semibold"
        style={{ color: colorFor(status), fontSize: size === 'sm' ? 10 : 11 }}
      >
        {label}
      </Text>
    </View>
  );
});
Badge.displayName = 'Badge';

const stylesheet = createStyleSheet((theme) => ({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
    gap: theme.spacing.xs,
    variants: {
      status: {
        pending: { backgroundColor: theme.colors.semantic.warningBg },
        paid: { backgroundColor: theme.colors.semantic.successBg },
        overdue: { backgroundColor: theme.colors.semantic.dangerBg },
        info: { backgroundColor: theme.colors.semantic.infoBg },
        new: { backgroundColor: theme.colors.brand.glow },
        brand: { backgroundColor: theme.colors.brand.glow },
        muted: { backgroundColor: theme.colors.bg.elevated },
      },
      size: {
        sm: { paddingHorizontal: theme.spacing.sm, paddingVertical: 2 },
        md: { paddingHorizontal: theme.spacing.md, paddingVertical: 4 },
      },
    },
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
}));
