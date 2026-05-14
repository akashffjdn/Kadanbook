import {
  Avatar,
  Button,
  EmptyState,
  IconButton,
  Screen,
  Sheet,
  type SheetRef,
  StatCard,
  Text,
} from '@/components/ui';
import { useHaptic } from '@/hooks/useHaptic';
import { useDataStore } from '@/store/data.store';
import type { Transaction } from '@/types/domain';
import { formatINR } from '@/utils/currency';
import { fmtRelative, fmtShortDate, fmtTime, sectionLabel } from '@/utils/date';
import { displayNationalPhone } from '@/utils/phone';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  IndianRupee,
  Mail,
  MessageCircle,
  MoreHorizontal,
  NotebookPen,
  Phone,
  Trash2,
} from 'lucide-react-native';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, SectionList, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList<Transaction>);

const HERO_HEIGHT = 240;

/**
 * Customer Detail.
 *
 * Design refs:
 *  - Apple Wallet card detail (parallax hero with subtle scroll deflation)
 *  - WhatsApp contact info (avatar + call/whatsapp/sms quick row)
 *  - CRED member detail (sticky CTA bar, transaction timeline with date headers)
 *  - Linear issue detail (clean section list, sticky headers)
 *
 * Composition:
 *  Parallax hero (avatar 64dp, name, phone, since-date, quick actions row)
 *  Stats strip (Pending / Total Paid / Last Activity)
 *  Sticky bottom action bar (Add Kadan / Collect Payment)
 *  Section-grouped transaction timeline (TODAY / YESTERDAY / MAY 10)
 */
export default function CustomerDetailRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trigger = useHaptic();
  const moreSheet = useRef<SheetRef>(null);

  const customer = useDataStore((s) => s.customers.find((c) => c.id === id));
  // Select the raw transactions array (stable reference) then derive the
  // filtered+sorted list with useMemo — calling getTransactionsForCustomer
  // inside the selector returns a new array each render and trips Zustand's
  // useSyncExternalStore "result of getSnapshot should be cached" guard.
  const allTransactions = useDataStore((s) => s.transactions);
  const transactions = useMemo(
    () =>
      allTransactions
        .filter((t) => t.customerId === id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [allTransactions, id],
  );
  const deleteCustomer = useDataStore((s) => s.deleteCustomer);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => (scrollY.value = e.contentOffset.y),
  });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HERO_HEIGHT],
          [0, -HERO_HEIGHT / 3],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(scrollY.value, [0, HERO_HEIGHT * 0.7], [1, 0], Extrapolation.CLAMP),
  }));

  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_HEIGHT * 0.4, HERO_HEIGHT * 0.7],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [HERO_HEIGHT * 0.4, HERO_HEIGHT * 0.7],
          [10, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const sections = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    transactions.forEach((tx) => {
      const key = sectionLabel(tx.createdAt);
      const arr = map.get(key) ?? [];
      arr.push(tx);
      map.set(key, arr);
    });
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [transactions]);

  const handleCall = useCallback(() => {
    if (!customer) return;
    Linking.openURL(`tel:${customer.phone}`);
  }, [customer]);
  const handleWhatsapp = useCallback(() => {
    if (!customer) return;
    Linking.openURL(`whatsapp://send?phone=${customer.phone.replace('+', '')}`);
  }, [customer]);
  const handleSms = useCallback(() => {
    if (!customer) return;
    Linking.openURL(`sms:${customer.phone}`);
  }, [customer]);

  const handleDelete = useCallback(() => {
    if (!customer) return;
    trigger('warning');
    deleteCustomer(customer.id);
    toast.success(t('customer.deleted'));
    router.back();
  }, [customer, deleteCustomer, router, t, trigger]);

  if (!customer) {
    return (
      <Screen padded edges={{ top: true, bottom: true }}>
        <EmptyState title="Customer not found" />
      </Screen>
    );
  }

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top }}>
      {/* Compact header (appears on scroll) */}
      <View style={[styles.compactBar, { paddingTop: 4 }]}>
        <IconButton
          icon={<ArrowLeft size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        />
        <Animated.View style={[styles.compactTitle, compactTitleStyle]}>
          <Text variant="subtitle" weight="semibold" numberOfLines={1}>
            {customer.name}
          </Text>
        </Animated.View>
        <IconButton
          icon={<MoreHorizontal size={22} color={theme.colors.text.primary} />}
          onPress={() => moreSheet.current?.snapToIndex(0)}
          accessibilityLabel="More"
        />
      </View>

      <AnimatedSectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        ListHeaderComponent={
          <>
            <Animated.View style={[styles.hero, heroStyle]}>
              <Avatar name={customer.name} size="xl" />
              <Text
                variant="title"
                weight="bold"
                style={{ marginTop: theme.spacing.md, fontSize: 24 }}
              >
                {customer.name}
              </Text>
              <Text variant="body" color="secondary" style={{ marginTop: 4 }}>
                +91 {displayNationalPhone(customer.phone)}
              </Text>
              <Text variant="caption" color="muted" style={{ marginTop: 4 }}>
                {t('customer.since', { date: fmtShortDate(customer.createdAt) })}
              </Text>

              <View style={styles.quickRow}>
                <QuickAction
                  icon={<Phone size={20} color={theme.colors.text.primary} />}
                  label={t('customer.call')}
                  onPress={handleCall}
                />
                <QuickAction
                  icon={<MessageCircle size={20} color={theme.colors.text.primary} />}
                  label={t('customer.whatsapp')}
                  onPress={handleWhatsapp}
                />
                <QuickAction
                  icon={<Mail size={20} color={theme.colors.text.primary} />}
                  label={t('customer.sms')}
                  onPress={handleSms}
                />
              </View>
            </Animated.View>

            <View style={styles.statsRow}>
              <View style={{ flex: 1 }}>
                <StatCard
                  label={t('customer.totalPending')}
                  value={customer.pendingAmount}
                  tone="pending"
                  compact
                  animate={false}
                />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard
                  label={t('customer.totalPaid')}
                  value={customer.totalPaid}
                  tone="paid"
                  compact
                  animate={false}
                />
              </View>
              <View style={{ flex: 1.1 }}>
                <View style={styles.activityCard}>
                  <Text variant="label" color="secondary">
                    {t('customer.lastActivity')}
                  </Text>
                  <Text
                    variant="bodyLarge"
                    weight="semibold"
                    style={{ marginTop: theme.spacing.sm, fontSize: 16 }}
                  >
                    {customer.lastActivityAt ? fmtRelative(customer.lastActivityAt) : '—'}
                  </Text>
                </View>
              </View>
            </View>

            {transactions.length === 0 ? (
              <View style={{ paddingTop: theme.spacing.xl }}>
                <EmptyState
                  icon={<NotebookPen size={32} color={theme.colors.text.secondary} />}
                  title={t('customer.noTransactions')}
                  actionLabel={t('customer.addFirstKadan')}
                  onAction={() =>
                    router.push({ pathname: '/kadan/new', params: { customerId: customer.id } })
                  }
                  compact
                />
              </View>
            ) : null}
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text variant="label" color="secondary">
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => <TransactionRow tx={item} />}
        SectionSeparatorComponent={() => <View style={{ height: 4 }} />}
      />

      {/* Sticky bottom CTA bar */}
      <View style={[styles.ctaBar, { paddingBottom: 16 + insets.bottom }]}>
        <View style={{ flex: 1 }}>
          <Button
            label={t('home.addKadan')}
            variant="secondary"
            leftIcon={<NotebookPen size={18} color={theme.colors.text.primary} />}
            onPress={() =>
              router.push({ pathname: '/kadan/new', params: { customerId: customer.id } })
            }
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label={t('home.collectPayment')}
            leftIcon={<IndianRupee size={18} color={theme.colors.text.onBrand} />}
            onPress={() =>
              router.push({ pathname: '/payment/collect', params: { customerId: customer.id } })
            }
          />
        </View>
      </View>

      <Sheet ref={moreSheet} snapPoints={['30%']} scrollable={false}>
        <Pressable
          onPress={() => {
            moreSheet.current?.close();
            router.push({ pathname: '/customer/new', params: { editId: customer.id } });
          }}
          style={({ pressed }) => [styles.moreRow, pressed && { opacity: 0.6 }]}
        >
          <NotebookPen size={20} color={theme.colors.text.primary} />
          <Text variant="bodyLarge" weight="semibold">
            {t('common.edit')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            moreSheet.current?.close();
            handleDelete();
          }}
          style={({ pressed }) => [styles.moreRow, pressed && { opacity: 0.6 }]}
        >
          <Trash2 size={20} color={theme.colors.semantic.danger} />
          <Text variant="bodyLarge" weight="semibold" color="danger">
            {t('common.delete')}
          </Text>
        </Pressable>
      </Sheet>
    </Screen>
  );
}

const QuickAction = ({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) => {
  const { styles } = useStyles(stylesheet);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.qa, pressed && { opacity: 0.6 }]}>
      <View style={styles.qaIcon}>{icon}</View>
      <Text variant="caption" weight="semibold">
        {label}
      </Text>
    </Pressable>
  );
};

const TransactionRow = ({ tx }: { tx: Transaction }) => {
  const { styles, theme } = useStyles(stylesheet);
  const isPayment = tx.type === 'payment';
  return (
    <View style={styles.txRow}>
      <View
        style={[
          styles.txIcon,
          {
            backgroundColor: isPayment
              ? theme.colors.semantic.successBg
              : theme.colors.semantic.warningBg,
          },
        ]}
      >
        {isPayment ? (
          <IndianRupee size={18} color={theme.colors.semantic.success} />
        ) : (
          <NotebookPen size={18} color={theme.colors.status.pending} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="semibold" numberOfLines={1}>
          {isPayment ? `Payment · ${tx.paymentMethod?.toUpperCase() ?? ''}` : 'Kadan'}
        </Text>
        {tx.notes ? (
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {tx.notes}
          </Text>
        ) : null}
        <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
          {fmtTime(tx.createdAt)}
        </Text>
      </View>
      <Text
        variant="bodyLarge"
        weight="bold"
        numeric
        style={{
          color: isPayment ? theme.colors.semantic.success : theme.colors.status.pending,
        }}
      >
        {isPayment ? '−' : '+'}
        {formatINR(tx.amount)}
      </Text>
    </View>
  );
};

const stylesheet = createStyleSheet((theme) => ({
  compactBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.bg.base,
  },
  compactTitle: { flex: 1, alignItems: 'center', paddingHorizontal: theme.spacing.md },
  hero: {
    alignItems: 'center',
    paddingTop: 56 + theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  quickRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  qa: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  qaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.md,
  },
  activityCard: {
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.md,
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.bg.base,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.bg.surface,
    marginHorizontal: theme.spacing.base,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.bg.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
}));
