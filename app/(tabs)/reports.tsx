import { Avatar, IconButton, Screen, SegmentedControl, StatCard, Text } from '@/components/ui';
import { useDataStore } from '@/store/data.store';
import { formatINR } from '@/utils/currency';
import { Activity, ArrowDownToLine, CheckCircle2, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

type Range = 'today' | 'week' | 'month' | 'year';

/**
 * Reports & Insights.
 *
 * Design refs:
 *  - Stripe Dashboard (data clarity, sparklines, period filter)
 *  - Mint (visual stat cards in 2x2 grid)
 *  - Linear analytics (clean section dividers)
 *  - Robinhood (color-coded delta indicators)
 *
 * Charts shown as composed views built with View+animated bars
 * (real Skia charts would be wired in production).
 */
export default function ReportsRoute() {
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const transactions = useDataStore((s) => s.transactions);
  const customers = useDataStore((s) => s.customers);

  const [range, setRange] = useState<Range>('week');

  const cutoff = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    switch (range) {
      case 'today':
        return now - day;
      case 'week':
        return now - 7 * day;
      case 'month':
        return now - 30 * day;
      default:
        return now - 365 * day;
    }
  }, [range]);

  const inRange = useMemo(
    () => transactions.filter((t) => t.createdAt >= cutoff),
    [transactions, cutoff],
  );
  const collected = inRange.filter((t) => t.type === 'payment').reduce((a, t) => a + t.amount, 0);
  const newKadans = inRange.filter((t) => t.type === 'kadan').length;
  const totalPending = customers.reduce((a, c) => a + c.pendingAmount, 0);
  const totalPaid = customers.reduce((a, c) => a + c.totalPaid, 0);
  const paidRatio = totalPaid + totalPending > 0 ? totalPaid / (totalPaid + totalPending) : 0;

  // Synthetic per-day trend (last 7 days) for the bar chart preview.
  const dailyTrend = useMemo(() => {
    const days = range === 'today' ? 1 : range === 'week' ? 7 : range === 'month' ? 30 : 12;
    const now = Date.now();
    const bucket = new Array(days).fill(0);
    transactions
      .filter((t) => t.type === 'payment' && t.createdAt >= now - days * 24 * 60 * 60 * 1000)
      .forEach((t) => {
        const idx = Math.min(days - 1, Math.floor((now - t.createdAt) / (24 * 60 * 60 * 1000)));
        bucket[days - 1 - idx] += t.amount;
      });
    return bucket;
  }, [transactions, range]);

  const trendMax = Math.max(...dailyTrend, 1);

  const topPending = useMemo(
    () =>
      [...customers]
        .filter((c) => c.pendingAmount > 0)
        .sort((a, b) => b.pendingAmount - a.pendingAmount)
        .slice(0, 5),
    [customers],
  );

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 8 }}>
      <View style={styles.headerRow}>
        <Text variant="title" weight="bold" style={{ fontSize: 28 }}>
          {t('reports.title')}
        </Text>
        <IconButton
          icon={<ArrowDownToLine size={20} color={theme.colors.text.primary} />}
          variant="tinted"
          onPress={() => undefined}
          accessibilityLabel="Export"
        />
      </View>

      <View style={{ paddingHorizontal: theme.spacing.base }}>
        <SegmentedControl
          segments={[
            { id: 'today', label: t('reports.filterToday') },
            { id: 'week', label: t('reports.filterWeek') },
            { id: 'month', label: t('reports.filterMonth') },
            { id: 'year', label: t('reports.filterYear') },
          ]}
          value={range}
          onChange={(v) => setRange(v as Range)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.spacing.base, paddingBottom: 120 }}
      >
        {/* Stat grid 2x2 */}
        <Animated.View entering={FadeInDown.duration(280)} style={styles.statsGrid}>
          <View style={styles.statHalf}>
            <StatCard
              label={t('reports.totalCollected')}
              value={collected}
              tone="paid"
              caption="in period"
            />
          </View>
          <View style={styles.statHalf}>
            <StatCard
              label={t('reports.totalPending')}
              value={totalPending}
              tone="pending"
              caption="all time"
            />
          </View>
          <View style={styles.statHalf}>
            <StatCard
              label={t('reports.newKadans')}
              value={newKadans}
              tone="brand"
              caption="entries"
              animate={false}
            />
          </View>
          <View style={styles.statHalf}>
            <StatCard
              label={t('reports.avgCollectionTime')}
              value={5}
              tone="neutral"
              caption="days"
              animate={false}
            />
          </View>
        </Animated.View>

        {/* Collection trend (animated bar chart) */}
        <Animated.View entering={FadeInDown.duration(280).delay(80)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartIconWrap}>
              <TrendingUp size={18} color={theme.colors.semantic.success} />
            </View>
            <Text variant="subtitle" weight="semibold">
              {t('reports.collectionTrend')}
            </Text>
          </View>
          <View style={styles.barRow}>
            {dailyTrend.map((v, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <Animated.View
                    entering={FadeInDown.duration(420).delay(120 + i * 30)}
                    style={[
                      styles.barFill,
                      {
                        height: `${(v / trendMax) * 100}%`,
                        backgroundColor:
                          v > 0 ? theme.colors.semantic.success : theme.colors.bg.elevated,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Paid vs Pending donut (composed) */}
        <Animated.View entering={FadeInDown.duration(280).delay(140)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartIconWrap}>
              <CheckCircle2 size={18} color={theme.colors.brand.primary} />
            </View>
            <Text variant="subtitle" weight="semibold">
              {t('reports.paidVsPending')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.lg }}>
            <View style={styles.donut}>
              <View style={[styles.donutInner, { backgroundColor: theme.colors.bg.surface }]}>
                <Text variant="title" weight="bold" style={{ fontSize: 22 }}>
                  {Math.round(paidRatio * 100)}%
                </Text>
                <Text variant="caption" color="secondary">
                  paid
                </Text>
              </View>
              <View
                style={[
                  styles.donutFill,
                  {
                    backgroundColor: theme.colors.semantic.success,
                    transform: [{ rotate: `${paidRatio * 360}deg` }],
                  },
                ]}
              />
            </View>
            <View style={{ flex: 1, gap: theme.spacing.md }}>
              <LegendRow
                color={theme.colors.semantic.success}
                label="Paid"
                value={formatINR(totalPaid)}
              />
              <LegendRow
                color={theme.colors.status.pending}
                label="Pending"
                value={formatINR(totalPending)}
              />
            </View>
          </View>
        </Animated.View>

        {/* Top pending */}
        <Animated.View entering={FadeInDown.duration(280).delay(200)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartIconWrap}>
              <Activity size={18} color={theme.colors.status.pending} />
            </View>
            <Text variant="subtitle" weight="semibold">
              {t('reports.topPending')}
            </Text>
          </View>
          <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.md }}>
            {topPending.map((c, i) => {
              const max = topPending[0]?.pendingAmount ?? 1;
              const pct = (c.pendingAmount / max) * 100;
              return (
                <View key={c.id} style={{ gap: 6 }}>
                  <View style={styles.topRow}>
                    <Avatar name={c.name} size="sm" />
                    <Text variant="body" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text variant="body" weight="bold" color="warning" numeric>
                      {formatINR(c.pendingAmount)}
                    </Text>
                  </View>
                  <View style={styles.barTrackThin}>
                    <Animated.View
                      entering={FadeInDown.duration(380).delay(240 + i * 30)}
                      style={[
                        styles.barFillThin,
                        {
                          width: `${pct}%`,
                          backgroundColor: theme.colors.status.pending,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
            {topPending.length === 0 ? (
              <Text variant="body" color="secondary" align="center">
                Nothing pending — great job!
              </Text>
            ) : null}
          </View>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const LegendRow = ({ color, label, value }: { color: string; label: string; value: string }) => {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text variant="body" color="secondary" style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant="body" weight="semibold" numeric>
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
    paddingVertical: theme.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statHalf: { flexBasis: '48%', flexGrow: 1 },
  chartCard: {
    backgroundColor: theme.colors.bg.surface,
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginTop: theme.spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  chartIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 120,
    marginTop: theme.spacing.md,
  },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  barTrack: {
    height: '100%',
    backgroundColor: theme.colors.bg.elevated,
    borderRadius: 6,
    justifyContent: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: 6, minHeight: 4 },
  donut: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.status.pending,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
    overflow: 'hidden',
  },
  donutFill: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    bottom: 0,
    transformOrigin: 'top center',
  },
  donutInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  barTrackThin: {
    height: 6,
    backgroundColor: theme.colors.bg.elevated,
    borderRadius: 3,
    marginLeft: 36,
  },
  barFillThin: { height: '100%', borderRadius: 3 },
}));
