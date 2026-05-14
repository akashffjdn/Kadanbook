import {
  Avatar,
  Button,
  EmptyState,
  Screen,
  SegmentedControl,
  Sheet,
  type SheetRef,
  Switch,
  Text,
} from '@/components/ui';
import { useHaptic } from '@/hooks/useHaptic';
import { useAuthStore } from '@/store/auth.store';
import { useDataStore } from '@/store/data.store';
import { useSettingsStore } from '@/store/settings.store';
import type { Customer } from '@/types/domain';
import { formatINR } from '@/utils/currency';
import { fmtRelative } from '@/utils/date';
import { openWhatsApp } from '@/utils/upi';
import { useRouter } from 'expo-router';
import { BellRing, MessageCircle, Send } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

type Tab = 'pending' | 'overdue' | 'history';

/**
 * Reminders tab.
 *
 * Design refs:
 *  - Mailchimp campaigns (multi-select with bulk action bar)
 *  - WhatsApp Business (template preview before send)
 *  - Linear inbox (sticky filter tabs)
 *  - Notion settings card (the auto-remind monthly toggle banner)
 */
export default function RemindersRoute() {
  const _router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const trigger = useHaptic();
  const sheetRef = useRef<SheetRef>(null);

  const customers = useDataStore((s) => s.customers);
  const reminderHistory = useDataStore((s) => s.reminderHistory);
  const recordReminderSent = useDataStore((s) => s.recordReminderSent);
  const monthlyAuto = useSettingsStore((s) => s.monthlyAutoReminders);
  const setMonthlyAuto = useSettingsStore((s) => s.setMonthlyAuto);
  const template = useSettingsStore((s) => s.reminderTemplate);
  const profile = useAuthStore((s) => s.profile);

  const [tab, setTab] = useState<Tab>('pending');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const list = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    let arr = customers.filter((c) => c.pendingAmount > 0);
    if (tab === 'overdue') {
      arr = arr.filter((c) => c.lastActivityAt !== null && c.lastActivityAt < cutoff);
    } else if (tab === 'history') {
      arr = customers
        .filter((c) => reminderHistory[c.id])
        .sort((a, b) => (reminderHistory[b.id] ?? 0) - (reminderHistory[a.id] ?? 0));
      return arr;
    }
    return arr.sort((a, b) => b.pendingAmount - a.pendingAmount);
  }, [customers, reminderHistory, tab]);

  const toggleSelect = useCallback(
    (id: string) => {
      trigger('select');
      setSelected((s) => {
        const ns = new Set(s);
        if (ns.has(id)) ns.delete(id);
        else ns.add(id);
        return ns;
      });
    },
    [trigger],
  );

  const buildMessage = useCallback(
    (c: Customer) =>
      template
        .replace('{name}', c.name)
        .replace('{amount}', String(c.pendingAmount))
        .replace('{shop_name}', profile?.shopName ?? 'KadanBook'),
    [template, profile],
  );

  const sendOne = useCallback(
    (c: Customer) => {
      openWhatsApp(c.phone, buildMessage(c));
      recordReminderSent(c.id);
      trigger('success');
      toast.success('Reminder sent');
    },
    [buildMessage, recordReminderSent, trigger],
  );

  const previewMsg = useMemo(() => {
    const sample = list[0] ?? customers[0];
    if (!sample) return template;
    return buildMessage(sample);
  }, [list, customers, buildMessage, template]);

  const handleBulkSend = useCallback(() => {
    sheetRef.current?.snapToIndex(0);
  }, []);

  const confirmBulk = useCallback(() => {
    const targets = list.filter((c) => selected.has(c.id));
    targets.forEach((c, i) => {
      setTimeout(() => sendOne(c), i * 200);
    });
    setSelected(new Set());
    sheetRef.current?.close();
  }, [list, selected, sendOne]);

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 8 }}>
      <View style={styles.headerRow}>
        <Text variant="title" weight="bold" style={{ fontSize: 28 }}>
          {t('reminder.title')}
        </Text>
      </View>

      {/* Auto-remind card */}
      <View style={styles.autoCard}>
        <View style={styles.autoIcon}>
          <BellRing size={20} color={theme.colors.brand.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="body" weight="semibold">
            {t('reminder.monthlyAuto')}
          </Text>
          <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
            {t('reminder.monthlyAutoBody')}
          </Text>
        </View>
        <Switch value={monthlyAuto} onValueChange={setMonthlyAuto} />
      </View>

      {/* Tabs */}
      <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.md }}>
        <SegmentedControl
          segments={[
            { id: 'pending', label: t('reminder.tabPending') },
            { id: 'overdue', label: t('reminder.tabOverdue') },
            { id: 'history', label: t('reminder.tabHistory') },
          ]}
          value={tab}
          onChange={(v) => setTab(v as Tab)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.spacing.base, paddingBottom: 220 }}
      >
        {list.length === 0 ? (
          <EmptyState
            icon={<BellRing size={36} color={theme.colors.text.secondary} />}
            title="Nothing to remind"
            description="All your customers are on track."
          />
        ) : (
          list.map((c) => {
            const checked = selected.has(c.id);
            const last = reminderHistory[c.id];
            return (
              <Pressable
                key={c.id}
                onPress={() => toggleSelect(c.id)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: checked ? theme.colors.brand.primary : 'transparent',
                      borderColor: checked
                        ? theme.colors.brand.primary
                        : theme.colors.border.strong,
                    },
                  ]}
                >
                  {checked ? (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>✓</Text>
                  ) : null}
                </View>
                <Avatar name={c.name} size="md" />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyLarge" weight="semibold" numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text variant="caption" color="muted">
                    {last
                      ? t('reminder.lastReminded', { when: fmtRelative(last) })
                      : t('reminder.neverReminded')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text variant="bodyLarge" weight="bold" color="warning" numeric>
                    {formatINR(c.pendingAmount)}
                  </Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      sendOne(c);
                    }}
                    hitSlop={6}
                    style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.6 }]}
                  >
                    <MessageCircle size={14} color="#fff" />
                    <Text variant="caption" weight="semibold" color="onBrand">
                      {t('reminder.send')}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Bulk action bar */}
      {selected.size > 0 ? (
        <View style={[styles.bulkBar, { paddingBottom: 16 + insets.bottom }]}>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight="semibold">
              {t('common.selected', { count: selected.size })}
            </Text>
          </View>
          <Pressable
            onPress={() => setSelected(new Set())}
            style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.6 }]}
          >
            <Text variant="body" weight="semibold" color="secondary">
              {t('common.cancel')}
            </Text>
          </Pressable>
          <Button
            label={t('reminder.send')}
            onPress={handleBulkSend}
            fullWidth={false}
            size="md"
            leftIcon={<Send size={16} color={theme.colors.text.onBrand} />}
          />
        </View>
      ) : null}

      {/* Confirmation sheet */}
      <Sheet
        ref={sheetRef}
        snapPoints={['65%']}
        title={t('reminder.bulkConfirmTitle', { count: selected.size })}
        subtitle={t('reminder.templatePreview')}
      >
        <View style={styles.preview}>
          <Text variant="body" style={{ lineHeight: 22 }}>
            {previewMsg}
          </Text>
        </View>
        <View style={{ marginTop: theme.spacing.lg }}>
          <Button label={`Send ${selected.size} reminders`} onPress={confirmBulk} size="xl" />
        </View>
        <View style={{ marginTop: theme.spacing.sm }}>
          <Button
            label={t('common.cancel')}
            variant="ghost"
            onPress={() => sheetRef.current?.close()}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  headerRow: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  autoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.base,
    backgroundColor: theme.colors.bg.surface,
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  autoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.brand.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.semantic.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  bulkBar: {
    position: 'absolute',
    left: theme.spacing.base,
    right: theme.spacing.base,
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.bg.elevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  clearBtn: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.sm },
  preview: {
    backgroundColor: theme.colors.bg.surface,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
}));
