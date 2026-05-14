import { Chip, EmptyState, IconButton, Screen, SwipeableRow, Text } from '@/components/ui';
import { useDataStore } from '@/store/data.store';
import type { AppNotification } from '@/types/domain';
import { fmtRelative, sectionLabel } from '@/utils/date';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  CheckCheck,
  CheckCircle2,
  MessageCircle,
  NotebookPen,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

type Filter = 'all' | 'unread' | 'payment' | 'reminder' | 'overdue';

const ICONS = {
  payment: { icon: CheckCircle2, color: 'success' as const },
  reminder: { icon: MessageCircle, color: 'info' as const },
  kadan: { icon: NotebookPen, color: 'warning' as const },
  overdue: { icon: AlertTriangle, color: 'danger' as const },
};

/**
 * Notifications inbox.
 *
 * Design refs:
 *  - Linear inbox (sticky filter chips, grouped by date)
 *  - Slack notifications (unread brightness + brand left bar)
 *  - Apple Mail (swipe right mark read, swipe left archive)
 */
export default function NotificationsRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const notifications = useDataStore((s) => s.notifications);
  const markRead = useDataStore((s) => s.markNotificationRead);
  const markAll = useDataStore((s) => s.markAllNotificationsRead);
  const archive = useDataStore((s) => s.archiveNotification);

  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      switch (filter) {
        case 'unread':
          return !n.read;
        case 'payment':
          return n.type === 'payment';
        case 'reminder':
          return n.type === 'reminder';
        case 'overdue':
          return n.type === 'overdue';
        default:
          return true;
      }
    });
  }, [notifications, filter]);

  const sections = useMemo(() => {
    const map = new Map<string, AppNotification[]>();
    filtered.forEach((n) => {
      const key = sectionLabel(n.createdAt);
      const arr = map.get(key) ?? [];
      arr.push(n);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 4 }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<ArrowLeft size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
        />
        <Text variant="subtitle" weight="semibold">
          {t('notifications.title')}
        </Text>
        <IconButton
          icon={<CheckCheck size={20} color={theme.colors.text.primary} />}
          onPress={() => {
            markAll();
            toast.success(t('notifications.markedRead'));
          }}
          variant="tinted"
          accessibilityLabel="Mark all read"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        style={styles.chipScrollOuter}
      >
        <Chip
          label={t('notifications.filterAll')}
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <Chip
          label={t('notifications.filterUnread')}
          selected={filter === 'unread'}
          onPress={() => setFilter('unread')}
        />
        <Chip
          label={t('notifications.filterPayments')}
          selected={filter === 'payment'}
          onPress={() => setFilter('payment')}
        />
        <Chip
          label={t('notifications.filterReminders')}
          selected={filter === 'reminder'}
          onPress={() => setFilter('reminder')}
        />
        <Chip
          label={t('notifications.filterAlerts')}
          selected={filter === 'overdue'}
          onPress={() => setFilter('overdue')}
        />
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={<BellRing size={36} color={theme.colors.text.secondary} />}
            title={t('notifications.noneTitle')}
            description={t('notifications.noneBody')}
          />
        ) : (
          sections.map(([title, items]) => (
            <View key={title}>
              <View style={styles.sectionHeader}>
                <Text variant="label" color="secondary">
                  {title}
                </Text>
              </View>
              {items.map((n, i) => {
                const cfg = ICONS[n.type];
                const Icon = cfg.icon;
                return (
                  <Animated.View key={n.id} entering={FadeInDown.duration(280).delay(i * 24)}>
                    <SwipeableRow
                      onPress={() => markRead(n.id)}
                      rightActions={[
                        {
                          label: 'Archive',
                          color: theme.colors.semantic.danger,
                          onPress: () => {
                            archive(n.id);
                            toast.success(t('notifications.archived'));
                          },
                        },
                      ]}
                      leftActions={[
                        {
                          label: 'Read',
                          color: theme.colors.brand.primary,
                          onPress: () => markRead(n.id),
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.row,
                          {
                            backgroundColor: n.read
                              ? theme.colors.bg.surface
                              : theme.colors.bg.elevated,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.unreadDot,
                            {
                              backgroundColor: n.read ? 'transparent' : theme.colors.brand.primary,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.iconWrap,
                            {
                              backgroundColor:
                                cfg.color === 'success'
                                  ? theme.colors.semantic.successBg
                                  : cfg.color === 'info'
                                    ? theme.colors.semantic.infoBg
                                    : cfg.color === 'warning'
                                      ? theme.colors.semantic.warningBg
                                      : theme.colors.semantic.dangerBg,
                            },
                          ]}
                        >
                          <Icon
                            size={18}
                            color={
                              cfg.color === 'success'
                                ? theme.colors.semantic.success
                                : cfg.color === 'info'
                                  ? theme.colors.semantic.info
                                  : cfg.color === 'warning'
                                    ? theme.colors.status.pending
                                    : theme.colors.semantic.danger
                            }
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            variant="body"
                            weight={n.read ? 'regular' : 'semibold'}
                            numberOfLines={1}
                          >
                            {n.title}
                          </Text>
                          <Text variant="caption" color="secondary" numberOfLines={1}>
                            {n.body}
                          </Text>
                        </View>
                        <Text variant="caption" color="muted">
                          {fmtRelative(n.createdAt)}
                        </Text>
                      </View>
                    </SwipeableRow>
                  </Animated.View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  chipScrollOuter: { flexGrow: 0, flexShrink: 0, maxHeight: 48 },
  chipScroll: {
    paddingHorizontal: theme.spacing.base,
    gap: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  unreadDot: { width: 6, height: 6, borderRadius: 3 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
