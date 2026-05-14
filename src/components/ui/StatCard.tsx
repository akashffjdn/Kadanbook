import { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { AnimatedNumber } from './AnimatedNumber';
import { Text } from './Text';

export interface StatCardProps {
  label: string;
  value: number;
  delta?: string;
  deltaPositive?: boolean;
  caption?: string;
  tone?: 'neutral' | 'pending' | 'paid' | 'overdue' | 'brand';
  animate?: boolean;
  compact?: boolean;
}

export const StatCard = memo<StatCardProps>(
  ({ label, value, delta, deltaPositive, caption, tone = 'neutral', animate = true, compact }) => {
    const { styles, theme } = useStyles(stylesheet);
    const accentColor = (() => {
      switch (tone) {
        case 'pending':
          return theme.colors.status.pending;
        case 'paid':
          return theme.colors.status.paid;
        case 'overdue':
          return theme.colors.status.overdue;
        case 'brand':
          return theme.colors.brand.primary;
        default:
          return theme.colors.text.primary;
      }
    })();
    return (
      <View style={[styles.card, compact && { padding: theme.spacing.md }]}>
        <Text variant="label" color="secondary">
          {label}
        </Text>
        {animate ? (
          <AnimatedNumber
            value={value}
            style={[styles.value, { color: accentColor, fontSize: compact ? 22 : 28 }]}
          />
        ) : (
          <Text style={[styles.value, { color: accentColor, fontSize: compact ? 22 : 28 }]} numeric>
            ₹{value.toLocaleString('en-IN')}
          </Text>
        )}
        {delta || caption ? (
          <View style={styles.metaRow}>
            {delta ? (
              <Text
                variant="caption"
                weight="semibold"
                color={deltaPositive ? 'success' : 'danger'}
              >
                {delta}
              </Text>
            ) : null}
            {caption ? (
              <Text variant="caption" color="muted">
                {caption}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  },
);
StatCard.displayName = 'StatCard';

const stylesheet = createStyleSheet((theme) => ({
  card: {
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.base,
  },
  value: {
    marginTop: theme.spacing.sm,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    padding: 0,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
}));
