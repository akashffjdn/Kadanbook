import {
  AnimatedNumber,
  Avatar,
  Badge,
  Button,
  IconButton,
  QuickAction,
  Screen,
  SectionHeader,
  Text,
} from '@/components/ui';
import { useGreeting } from '@/hooks/useGreeting';
import { useAuthStore } from '@/store/auth.store';
import {
  useCustomerCount,
  useDataStore,
  useOverdueCount,
  useTodayCollection,
  useTotalPending,
  useUnreadNotificationCount,
} from '@/store/data.store';
import { formatINR } from '@/utils/currency';
import { fmtRelative } from '@/utils/date';
import { useRouter } from 'expo-router';
import {
  ArrowUpRight,
  Bell,
  BellRing,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
  NotebookPen,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

/**
 * Home Dashboard — HERO screen of the app.
 *
 * Design refs:
 *  - CRED home (oversized brand stats, premium dark surface, card stacking)
 *  - Cash App (single hero number with delta indicator)
 *  - Revolut (horizontal mini cards for today's snapshot)
 *  - Mint (color-coded recent activity feed)
 *  - Apple Wallet (quick action tiles 2x2 grid)
 *
 * Composition (top → bottom):
 *  A. Header — avatar, greeting, notification bell with unread dot
 *  B. Hero Pending Card — radial glow, animated count-up, 2 inline CTAs, badges
 *  C. Today's Snapshot — horizontal scroll: collected / customers / reminders
 *  D. Quick Actions 2x2 — Add Customer / Add Kadan / Collect / Remind
 *  E. Recent Activity — section header + "See All"
 */
export default function HomeRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const greeting = useGreeting();

  const profile = useAuthStore((s) => s.profile);
  const transactions = useDataStore((s) => s.transactions);
  const customers = useDataStore((s) => s.customers);

  const pending = useTotalPending();
  const customerCount = useCustomerCount();
  const overdue = useOverdueCount();
  const todayCollected = useTodayCollection();
  const unread = useUnreadNotificationCount();

  const recent = transactions.slice(0, 5);
  const lookup = useCallback((id: string) => customers.find((c) => c.id === id), [customers]);

  return (
    <Screen
      scrollable
      padded={false}
      edges={{ top: false, bottom: false }}
      style={{ paddingTop: insets.top + 4 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        {/* A. Header */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.headerLeft}
            onPress={() => router.push('/(tabs)/profile')}
            hitSlop={8}
          >
            <Avatar name={profile?.shopName ?? 'KadanBook'} size="md" />
            <View>
              <Text variant="caption" color="secondary">
                {greeting}
              </Text>
              <Text variant="bodyLarge" weight="bold" numberOfLines={1}>
                {profile?.shopName ?? 'KadanBook'}
              </Text>
            </View>
          </Pressable>

          <IconButton
            icon={<Bell size={22} color={theme.colors.text.primary} />}
            onPress={() => router.push('/notifications')}
            variant="tinted"
            badge={unread > 0}
            accessibilityLabel="Notifications"
          />
        </View>

        {/* B. Hero Pending Card */}
        <Animated.View entering={FadeInDown.duration(360).delay(60)}>
          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={styles.heroTopRow}>
              <Text variant="label" color="secondary">
                {t('home.totalPending')}
              </Text>
              {todayCollected > 0 ? (
                <View style={styles.deltaPill}>
                  <ArrowUpRight size={12} color={theme.colors.semantic.success} />
                  <Text variant="caption" weight="semibold" color="success">
                    {formatINR(todayCollected)}
                  </Text>
                </View>
              ) : null}
            </View>

            <AnimatedNumber value={pending} style={styles.heroAmount} duration={700} />

            <View style={styles.heroMetaRow}>
              <Text variant="body" color="secondary">
                {t('home.fromCustomers', { count: customerCount })}
              </Text>
              {overdue > 0 ? (
                <Badge
                  label={t('home.overdueCount', { count: overdue })}
                  status="overdue"
                  size="sm"
                />
              ) : null}
            </View>

            <View style={styles.heroCtaRow}>
              <Button
                label={t('home.collectPayment')}
                onPress={() => router.push('/(tabs)/customers')}
                variant="primary"
                size="md"
                leftIcon={<IndianRupee size={16} color={theme.colors.text.onBrand} />}
              />
              <Button
                label={t('home.addKadan')}
                onPress={() => router.push('/kadan/new')}
                variant="secondary"
                size="md"
                leftIcon={<NotebookPen size={16} color={theme.colors.text.primary} />}
              />
            </View>
          </View>
        </Animated.View>

        {/* C. Today's Snapshot */}
        <Animated.View entering={FadeInDown.duration(360).delay(120)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.snapshotScroll}
          >
            <MiniStat
              icon={<CheckCircle2 size={18} color={theme.colors.semantic.success} />}
              label={t('home.todayCollection')}
              value={formatINR(todayCollected)}
              tint={theme.colors.semantic.success}
            />
            <MiniStat
              icon={<Users size={18} color={theme.colors.semantic.info} />}
              label={t('home.customersCount')}
              value={String(customerCount)}
              tint={theme.colors.semantic.info}
            />
            <MiniStat
              icon={<BellRing size={18} color={theme.colors.status.pending} />}
              label={t('home.remindersPending')}
              value={String(customers.filter((c) => c.pendingAmount > 0).length)}
              tint={theme.colors.status.pending}
            />
          </ScrollView>
        </Animated.View>

        {/* D. Quick Actions 2x2 */}
        <Animated.View entering={FadeInDown.duration(360).delay(180)}>
          <View style={styles.quickGrid}>
            <View style={styles.quickRow}>
              <QuickAction
                icon={<UserPlus size={22} color={theme.colors.brand.primary} />}
                label={t('home.addCustomer')}
                onPress={() => router.push('/customer/new')}
              />
              <QuickAction
                icon={<NotebookPen size={22} color={theme.colors.brand.primary} />}
                label={t('home.addKadan')}
                onPress={() => router.push('/kadan/new')}
              />
            </View>
            <View style={styles.quickRow}>
              <QuickAction
                icon={<IndianRupee size={22} color={theme.colors.semantic.success} />}
                label={t('home.collectPayment')}
                tint={theme.colors.semantic.success}
                onPress={() => router.push('/(tabs)/customers')}
              />
              <QuickAction
                icon={<BellRing size={22} color={theme.colors.semantic.info} />}
                label={t('home.sendReminder')}
                tint={theme.colors.semantic.info}
                onPress={() => router.push('/(tabs)/reminders')}
              />
            </View>
          </View>
        </Animated.View>

        {/* E. Recent Activity */}
        <Animated.View entering={FadeInDown.duration(360).delay(240)}>
          <SectionHeader
            title={t('home.recentActivity')}
            actionLabel={t('common.seeAll')}
            onAction={() => router.push('/notifications')}
          />
          <View style={styles.activityList}>
            {recent.length === 0 ? (
              <View style={styles.empty}>
                <Text variant="body" color="secondary" align="center">
                  {t('home.noActivity')}
                </Text>
              </View>
            ) : (
              recent.map((tx) => {
                const c = lookup(tx.customerId);
                const isPayment = tx.type === 'payment';
                return (
                  <Pressable
                    key={tx.id}
                    onPress={() => c && router.push(`/customer/${c.id}` as any)}
                    style={({ pressed }) => [styles.activityRow, pressed && { opacity: 0.7 }]}
                  >
                    <View
                      style={[
                        styles.accent,
                        {
                          backgroundColor: isPayment
                            ? theme.colors.semantic.success
                            : theme.colors.brand.primary,
                        },
                      ]}
                    />
                    <Avatar name={c?.name ?? '?'} size="sm" />
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="semibold" numberOfLines={1}>
                        {isPayment ? `${c?.name ?? '—'} paid` : `${c?.name ?? '—'} kadan`}
                      </Text>
                      <Text variant="caption" color="muted" numberOfLines={1}>
                        {tx.notes ?? (isPayment ? tx.paymentMethod?.toUpperCase() : '—')}
                        {' · '}
                        {fmtRelative(tx.createdAt)}
                      </Text>
                    </View>
                    <Text
                      variant="bodyLarge"
                      weight="bold"
                      numeric
                      style={{
                        color: isPayment
                          ? theme.colors.semantic.success
                          : theme.colors.status.pending,
                      }}
                    >
                      {isPayment ? '+' : ''}
                      {formatINR(tx.amount)}
                    </Text>
                    <ChevronRight size={16} color={theme.colors.text.muted} />
                  </Pressable>
                );
              })
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const MiniStat = ({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
}) => {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={[styles.miniStat, { borderLeftColor: tint }]}>
      <View style={styles.miniIconRow}>
        {icon}
        <Text variant="caption" color="secondary">
          {label}
        </Text>
      </View>
      <Text variant="title" weight="bold" style={styles.miniValue} numeric>
        {value}
      </Text>
    </View>
  );
};

const stylesheet = createStyleSheet((theme) => ({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 },

  hero: {
    marginHorizontal: theme.spacing.base,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: theme.colors.brand.glow,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.semantic.successBg,
  },
  heroAmount: {
    marginTop: theme.spacing.md,
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.5,
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
    padding: 0,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },

  snapshotScroll: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  miniStat: {
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderLeftWidth: 3,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    minWidth: 150,
  },
  miniIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniValue: { marginTop: theme.spacing.xs, fontSize: 22, letterSpacing: -0.4 },

  quickGrid: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  quickRow: { flexDirection: 'row', gap: theme.spacing.md },

  activityList: {
    marginHorizontal: theme.spacing.base,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  accent: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: -8,
  },
  empty: { padding: theme.spacing.xl, alignItems: 'center' },
}));
