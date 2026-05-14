import { CustomerPickerSheet } from '@/components/domain/CustomerPickerSheet';
import {
  AmountInput,
  Avatar,
  Button,
  Chip,
  IconButton,
  Input,
  NumPad,
  PressableInputField,
  Screen,
  type SheetRef,
  SuccessOverlay,
  Text,
} from '@/components/ui';
import { useHaptic } from '@/hooks/useHaptic';
import { useDataStore } from '@/store/data.store';
import type { Customer } from '@/types/domain';
import { formatINR } from '@/utils/currency';
import { fmtShortDate } from '@/utils/date';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, ChevronRight, Mic, NotebookPen, User, X } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

const QUICK = [50, 100, 200, 500, 1000];

/**
 * Add Kadan (new debt).
 *
 * Design refs:
 *  - Cash App send-money (massive amount + numpad below)
 *  - Splitwise quick split (quick chip preset amounts)
 *  - Linear new-issue command palette (clean modal layout)
 *
 * Composition:
 *  Top: customer picker → amount → notes → due date
 *  Bottom: quick chips, custom numpad, sticky save with live amount
 */
export default function KadanNewRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const trigger = useHaptic();
  const params = useLocalSearchParams<{ customerId?: string }>();

  const customers = useDataStore((s) => s.customers);
  const addTransaction = useDataStore((s) => s.addTransaction);
  const sheetRef = useRef<SheetRef>(null);

  const [customer, setCustomer] = useState<Customer | undefined>(
    params.customerId ? customers.find((c) => c.id === params.customerId) : undefined,
  );
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<number | undefined>();
  const [success, setSuccess] = useState(false);

  const dueLabel = useMemo(() => {
    if (!dueDate) return t('kadan.dueToday');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = today.getTime() + 24 * 60 * 60 * 1000;
    if (dueDate === today.getTime()) return t('kadan.dueToday');
    if (dueDate === tomorrow) return t('kadan.dueTomorrow');
    return fmtShortDate(dueDate);
  }, [dueDate, t]);

  const onDigit = useCallback(
    (d: string) => {
      trigger('light');
      const next = `${amount}${d}`.replace(/^0+/, '');
      const n = Number.parseInt(next || '0', 10);
      if (n > 9_999_999) return;
      setAmount(n);
    },
    [amount, trigger],
  );

  const onBackspace = useCallback(() => {
    trigger('light');
    setAmount((a) => Math.floor(a / 10));
  }, [trigger]);

  const onQuickAmount = useCallback(
    (n: number) => {
      trigger('select');
      setAmount((a) => Math.min(9_999_999, a + n));
    },
    [trigger],
  );

  const handleSave = useCallback(() => {
    if (!customer) {
      toast.error('Select a customer first');
      sheetRef.current?.snapToIndex(0);
      return;
    }
    if (amount <= 0) {
      toast.error('Enter an amount');
      trigger('error');
      return;
    }
    addTransaction({
      customerId: customer.id,
      type: 'kadan',
      amount,
      notes: notes.trim() || undefined,
      dueDate,
    });
    trigger('success');
    setSuccess(true);
  }, [customer, amount, notes, dueDate, addTransaction, trigger]);

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<X size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
          accessibilityLabel="Close"
        />
        <Text variant="subtitle" weight="semibold">
          {t('kadan.newTitle')}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text
          variant="label"
          color="secondary"
          align="center"
          style={{ marginTop: theme.spacing.lg, fontSize: 12, letterSpacing: 1 }}
        >
          {t('kadan.howMuch')}
        </Text>
        <AmountInput value={amount} size="2xl" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {QUICK.map((n) => (
            <Chip key={n} label={`+₹${n}`} onPress={() => onQuickAmount(n)} />
          ))}
        </ScrollView>

        <View style={styles.fields}>
          {customer ? (
            <Pressable
              onPress={() => sheetRef.current?.snapToIndex(0)}
              style={({ pressed }) => [styles.customerCard, pressed && { opacity: 0.7 }]}
            >
              <Avatar name={customer.name} size="md" />
              <View style={{ flex: 1 }}>
                <Text variant="bodyLarge" weight="semibold" numberOfLines={1}>
                  {customer.name}
                </Text>
                <Text variant="caption" color="secondary">
                  +91 {customer.phone.replace('+91', '')}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.muted} />
            </Pressable>
          ) : (
            <PressableInputField
              label={t('kadan.selectCustomer')}
              value={undefined}
              placeholder="Tap to choose"
              onPress={() => sheetRef.current?.snapToIndex(0)}
              leftIcon={<User size={20} color={theme.colors.text.secondary} />}
              rightIcon={<ChevronRight size={20} color={theme.colors.text.muted} />}
            />
          )}

          <Input
            label={t('kadan.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('kadan.notesPlaceholder')}
            leftIcon={<NotebookPen size={20} color={theme.colors.text.secondary} />}
          />

          <PressableInputField
            label={t('kadan.dueDate')}
            value={dueLabel}
            onPress={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              setDueDate(today.getTime() + 24 * 60 * 60 * 1000);
            }}
            leftIcon={<Calendar size={20} color={theme.colors.text.secondary} />}
            rightIcon={<ChevronRight size={20} color={theme.colors.text.muted} />}
          />
        </View>

      </ScrollView>

      {/* Numpad */}
      <NumPad onDigit={onDigit} onBackspace={onBackspace} />

      <View style={styles.footer}>
        <Button
          label={amount > 0 ? t('kadan.save', { amount: formatINR(amount) }) : t('common.save')}
          onPress={handleSave}
          size="xl"
          disabled={amount <= 0 || !customer}
        />
      </View>

      <CustomerPickerSheet
        ref={sheetRef}
        onSelect={(c) => {
          setCustomer(c);
          sheetRef.current?.close();
        }}
      />

      <SuccessOverlay
        visible={success}
        title={t('kadan.savedToast')}
        subtitle={customer ? `${customer.name} · ${formatINR(amount)}` : undefined}
        autoDismissMs={1600}
        onAutoDismiss={() => {
          setSuccess(false);
          router.back();
        }}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  chipScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  fields: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.base,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
  },
  soonPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: theme.colors.brand.glow,
    borderRadius: theme.radius.full,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.bg.base,
  },
}));
