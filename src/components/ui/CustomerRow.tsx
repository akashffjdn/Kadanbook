import type { Customer } from '@/types/domain';
import { formatINR } from '@/utils/currency';
import { displayNationalPhone } from '@/utils/phone';
import { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Text } from './Text';

export interface CustomerRowProps {
  customer: Customer;
  onPress?: () => void;
}

export const CustomerRow = memo<CustomerRowProps>(({ customer }) => {
  const { styles, theme } = useStyles(stylesheet);
  const status = customer.pendingAmount === 0 ? 'paid' : 'pending';
  const overdue =
    customer.lastActivityAt && Date.now() - customer.lastActivityAt > 1000 * 60 * 60 * 24 * 14;
  const statusLabel =
    overdue && customer.pendingAmount > 0 ? 'Overdue' : status === 'paid' ? 'Paid' : 'Pending';
  const statusKind = overdue && customer.pendingAmount > 0 ? 'overdue' : status;

  return (
    <View style={styles.row}>
      <Avatar name={customer.name} size="md" />
      <View style={styles.body}>
        <Text variant="bodyLarge" weight="semibold" numberOfLines={1}>
          {customer.name}
        </Text>
        <Text variant="caption" color="secondary" numberOfLines={1}>
          {displayNationalPhone(customer.phone)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          variant="bodyLarge"
          weight="bold"
          style={{
            color:
              customer.pendingAmount > 0
                ? theme.colors.status.pending
                : theme.colors.text.secondary,
          }}
          numeric
        >
          {formatINR(customer.pendingAmount)}
        </Text>
        <Badge label={statusLabel} status={statusKind} size="sm" />
      </View>
    </View>
  );
});
CustomerRow.displayName = 'CustomerRow';

const stylesheet = createStyleSheet((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.bg.base,
    minHeight: 72,
  },
  body: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
}));
