import { Avatar, Input, Sheet, type SheetRef, Text } from '@/components/ui';
import { useDataStore } from '@/store/data.store';
import type { Customer } from '@/types/domain';
import { formatINR } from '@/utils/currency';
import { displayNationalPhone } from '@/utils/phone';
import { Search } from 'lucide-react-native';
import { forwardRef, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

export interface CustomerPickerSheetProps {
  onSelect: (c: Customer) => void;
}

export const CustomerPickerSheet = memo(
  forwardRef<SheetRef, CustomerPickerSheetProps>(({ onSelect }, ref) => {
    const { styles, theme } = useStyles(stylesheet);
    const { t } = useTranslation();
    const customers = useDataStore((s) => s.customers);
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return customers;
      return customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }, [customers, query]);

    return (
      <Sheet ref={ref} snapPoints={['85%']} title={t('kadan.selectCustomer')}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={t('customer.searchPlaceholder')}
          leftIcon={<Search size={20} color={theme.colors.text.secondary} />}
          showLabel={false}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <View style={{ marginTop: theme.spacing.lg }}>
          {filtered.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => onSelect(c)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            >
              <Avatar name={c.name} size="md" />
              <View style={{ flex: 1 }}>
                <Text variant="bodyLarge" weight="semibold" numberOfLines={1}>
                  {c.name}
                </Text>
                <Text variant="caption" color="secondary">
                  +91 {displayNationalPhone(c.phone)}
                </Text>
              </View>
              {c.pendingAmount > 0 ? (
                <Text variant="body" weight="semibold" color="warning" numeric>
                  {formatINR(c.pendingAmount)}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </Sheet>
    );
  }),
);
CustomerPickerSheet.displayName = 'CustomerPickerSheet';

const stylesheet = createStyleSheet((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
}));
