import {
  Chip,
  CustomerRow,
  EmptyState,
  FAB,
  IconButton,
  Input,
  Screen,
  Sheet,
  type SheetRef,
  SwipeableRow,
  Text,
} from '@/components/ui';
import { useDataStore } from '@/store/data.store';
import type { Customer } from '@/types/domain';
import { useRouter } from 'expo-router';
import {
  IndianRupee,
  MessageCircle,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

type Filter = 'all' | 'pending' | 'paid' | 'overdue';
type SortBy = 'name' | 'recent' | 'highest' | 'lowest';

/**
 * Customers list.
 *
 * Design refs:
 *  - WhatsApp chat list (compact 72dp row, swipe actions)
 *  - Linear inbox (sticky filter chips with counts)
 *  - Khatabook (proven Indian SMB list pattern)
 *  - Apple Mail (large title that collapses)
 *
 * Features: search, filter chips with counts, sort sheet, swipe-right reveal
 * (Remind/Collect), swipe-left reveal (Call/Whatsapp), empty + skeleton states.
 */
export default function CustomersRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const customers = useDataStore((s) => s.customers);
  const sheetRef = useRef<SheetRef>(null);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = customers.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.phone.includes(q)) return false;
      switch (filter) {
        case 'pending':
          return c.pendingAmount > 0;
        case 'paid':
          return c.pendingAmount === 0;
        case 'overdue': {
          const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
          return c.pendingAmount > 0 && c.lastActivityAt !== null && c.lastActivityAt < cutoff;
        }
        default:
          return true;
      }
    });
    arr = [...arr].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'highest':
          return b.pendingAmount - a.pendingAmount;
        case 'lowest':
          return a.pendingAmount - b.pendingAmount;
        default:
          return (b.lastActivityAt ?? 0) - (a.lastActivityAt ?? 0);
      }
    });
    return arr;
  }, [customers, query, filter, sortBy]);

  const counts = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    return {
      all: customers.length,
      pending: customers.filter((c) => c.pendingAmount > 0).length,
      paid: customers.filter((c) => c.pendingAmount === 0).length,
      overdue: customers.filter(
        (c) => c.pendingAmount > 0 && c.lastActivityAt !== null && c.lastActivityAt < cutoff,
      ).length,
    };
  }, [customers]);

  const handleCall = useCallback((c: Customer) => {
    Linking.openURL(`tel:${c.phone}`);
  }, []);
  const handleWhatsapp = useCallback((c: Customer) => {
    const phone = c.phone.replace('+', '');
    Linking.openURL(`whatsapp://send?phone=${phone}`);
  }, []);

  const renderEmpty = () => (
    <EmptyState
      icon={<Users size={36} color={theme.colors.text.secondary} />}
      title={query ? `No results for "${query}"` : t('customer.noneTitle')}
      description={query ? undefined : t('customer.noneBody')}
      actionLabel={query ? undefined : t('customer.addFirst')}
      onAction={query ? undefined : () => router.push('/customer/new')}
    />
  );

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 8 }}>
      {/* Large title header */}
      <View style={styles.headerRow}>
        <Text variant="title" weight="bold" style={{ fontSize: 28 }}>
          {t('customer.title')}
        </Text>
        <IconButton
          icon={<SlidersHorizontal size={20} color={theme.colors.text.primary} />}
          onPress={() => sheetRef.current?.snapToIndex(0)}
          variant="tinted"
          accessibilityLabel="Sort"
        />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={t('customer.searchPlaceholder')}
          leftIcon={<Search size={20} color={theme.colors.text.secondary} />}
          showLabel={false}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        style={styles.chipScrollOuter}
      >
        <Chip
          label={t('customer.filterAll')}
          count={counts.all}
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <Chip
          label={t('customer.filterPending')}
          count={counts.pending}
          selected={filter === 'pending'}
          onPress={() => setFilter('pending')}
        />
        <Chip
          label={t('customer.filterPaid')}
          count={counts.paid}
          selected={filter === 'paid'}
          onPress={() => setFilter('paid')}
        />
        <Chip
          label={t('customer.filterOverdue')}
          count={counts.overdue}
          selected={filter === 'overdue'}
          onPress={() => setFilter('overdue')}
        />
      </ScrollView>

      {/* List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {filtered.length === 0
          ? renderEmpty()
          : filtered.map((c, i) => (
              <Animated.View
                key={c.id}
                entering={FadeInDown.duration(280)
                  .delay(i * 28)
                  .springify()}
              >
                <SwipeableRow
                  onPress={() => router.push(`/customer/${c.id}` as any)}
                  rightActions={[
                    {
                      label: t('home.sendReminder'),
                      color: theme.colors.status.pending,
                      icon: <MessageCircle size={20} color="#fff" />,
                      onPress: () => handleWhatsapp(c),
                    },
                    {
                      label: t('home.collectPayment'),
                      color: theme.colors.semantic.success,
                      icon: <IndianRupee size={20} color="#fff" />,
                      onPress: () =>
                        router.push({
                          pathname: '/payment/collect',
                          params: { customerId: c.id },
                        }),
                    },
                  ]}
                  leftActions={[
                    {
                      label: t('customer.call'),
                      color: theme.colors.semantic.info,
                      icon: <Phone size={20} color="#fff" />,
                      onPress: () => handleCall(c),
                    },
                  ]}
                >
                  <CustomerRow customer={c} />
                  <View style={styles.divider} />
                </SwipeableRow>
              </Animated.View>
            ))}
      </ScrollView>

      <FAB
        icon={<Plus size={26} color={theme.colors.text.onBrand} strokeWidth={2.5} />}
        onPress={() => router.push('/customer/new')}
        bottom={88 + insets.bottom}
      />

      {/* Sort sheet */}
      <Sheet ref={sheetRef} snapPoints={['45%']} title="Sort by" scrollable={false}>
        {(
          [
            { id: 'recent', label: t('customer.sortRecent') },
            { id: 'name', label: t('customer.sortName') },
            { id: 'highest', label: t('customer.sortHighest') },
            { id: 'lowest', label: t('customer.sortLowest') },
          ] as { id: SortBy; label: string }[]
        ).map((opt) => (
          <Pressable
            key={opt.id}
            onPress={() => {
              setSortBy(opt.id);
              sheetRef.current?.close();
            }}
            style={({ pressed }) => [styles.sortRow, pressed && { opacity: 0.6 }]}
          >
            <Text variant="bodyLarge" weight={sortBy === opt.id ? 'semibold' : 'regular'}>
              {opt.label}
            </Text>
            {sortBy === opt.id ? (
              <View style={[styles.sortDot, { backgroundColor: theme.colors.brand.primary }]} />
            ) : null}
          </Pressable>
        ))}
      </Sheet>
    </Screen>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  searchWrap: { paddingHorizontal: theme.spacing.base, paddingBottom: theme.spacing.sm },
  chipScrollOuter: { flexGrow: 0, flexShrink: 0, maxHeight: 48 },
  chipScroll: {
    paddingHorizontal: theme.spacing.base,
    gap: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  divider: { height: 1, backgroundColor: theme.colors.border.subtle, marginLeft: 72 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  sortDot: { width: 10, height: 10, borderRadius: 5 },
}));
