import {
  AmountInput,
  Avatar,
  Button,
  Chip,
  IconButton,
  NumPad,
  Screen,
  SuccessOverlay,
  Switch,
  Text,
} from '@/components/ui';
import { useHaptic } from '@/hooks/useHaptic';
import { useDataStore } from '@/store/data.store';
import type { PaymentMethod, UPIApp } from '@/types/domain';
import { formatINR } from '@/utils/currency';
import { displayNationalPhone } from '@/utils/phone';
import { openUPI, openWhatsApp } from '@/utils/upi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Banknote, CreditCard, MoreHorizontal, Smartphone, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

/**
 * Collect Payment.
 *
 * Design refs:
 *  - Google Pay (UPI deep-link flow with detected apps)
 *  - Apple Pay (full-screen success takeover)
 *  - Razorpay checkout (clean payment method tiles)
 *  - Cash App (collect-full toggle)
 *  - Stripe success animation (giant green check + confetti)
 */
export default function PaymentCollectRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const trigger = useHaptic();
  const params = useLocalSearchParams<{ customerId?: string }>();

  const customer = useDataStore((s) => s.customers.find((c) => c.id === params.customerId));
  const addTransaction = useDataStore((s) => s.addTransaction);

  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [success, setSuccess] = useState(false);
  const [collectFull, setCollectFull] = useState(false);

  const remaining = useMemo(() => {
    if (!customer) return 0;
    return Math.max(0, customer.pendingAmount - amount);
  }, [customer, amount]);

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

  const handleCollectFull = useCallback(
    (v: boolean) => {
      setCollectFull(v);
      if (v && customer) setAmount(customer.pendingAmount);
      else setAmount(0);
    },
    [customer],
  );

  const launchUpiApp = useCallback(
    async (app: UPIApp) => {
      if (!customer || amount <= 0) {
        toast.error('Enter an amount first');
        return;
      }
      const ok = await openUPI(app === 'other' ? 'generic' : app, {
        payeeVPA: 'kadanbook@upi', // placeholder; user UPI ID stored in profile
        payeeName: 'KadanBook',
        amount,
        note: `Payment from ${customer.name}`,
      });
      if (!ok) toast.error('UPI app not installed');
    },
    [customer, amount],
  );

  const handleConfirm = useCallback(() => {
    if (!customer || amount <= 0) {
      trigger('error');
      toast.error('Enter an amount');
      return;
    }
    addTransaction({
      customerId: customer.id,
      type: 'payment',
      amount,
      paymentMethod: method,
    });
    trigger('success');
    setSuccess(true);
  }, [customer, amount, method, addTransaction, trigger]);

  const handleSendReceipt = useCallback(() => {
    if (!customer) return;
    const msg = `வணக்கம் ${customer.name},\n\nஉங்களின் ₹${amount} பணம் பெறப்பட்டது.\n\nநன்றி,\nKadanBook`;
    openWhatsApp(customer.phone, msg);
  }, [customer, amount]);

  if (!customer) {
    return (
      <Screen padded edges={{ top: true, bottom: false }}>
        <Text variant="title">No customer selected</Text>
      </Screen>
    );
  }

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<X size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
          accessibilityLabel="Close"
        />
        <Text variant="subtitle" weight="semibold">
          {t('payment.title')}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Customer banner */}
        <View style={styles.banner}>
          <Avatar name={customer.name} size="md" />
          <View style={{ flex: 1 }}>
            <Text variant="bodyLarge" weight="semibold">
              {customer.name}
            </Text>
            <Text variant="caption" color="secondary">
              +91 {displayNationalPhone(customer.phone)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="label" color="secondary">
              {t('payment.pendingLabel')}
            </Text>
            <Text variant="bodyLarge" weight="bold" color="warning" numeric>
              {formatINR(customer.pendingAmount)}
            </Text>
          </View>
        </View>

        <Text
          variant="label"
          color="secondary"
          align="center"
          style={{ marginTop: theme.spacing.lg, fontSize: 12, letterSpacing: 1 }}
        >
          {t('payment.receive')}
        </Text>
        <AmountInput value={amount} size="2xl" />

        <View style={styles.remainingRow}>
          <Text variant="body" color="secondary">
            {t('payment.remaining', { amount: formatINR(remaining) })}
          </Text>
        </View>

        <View style={styles.collectFullRow}>
          <View>
            <Text variant="body" weight="semibold">
              {t('payment.collectFull', { amount: formatINR(customer.pendingAmount) })}
            </Text>
          </View>
          <Switch value={collectFull} onValueChange={handleCollectFull} />
        </View>

        {/* Method tiles */}
        <View style={styles.methodGrid}>
          <MethodTile
            label={t('payment.cash')}
            icon={<Banknote size={22} color={theme.colors.semantic.success} />}
            active={method === 'cash'}
            onPress={() => setMethod('cash')}
          />
          <MethodTile
            label={t('payment.upi')}
            icon={<Smartphone size={22} color={theme.colors.brand.primary} />}
            active={method === 'upi'}
            onPress={() => setMethod('upi')}
          />
          <MethodTile
            label={t('payment.card')}
            icon={<CreditCard size={22} color={theme.colors.semantic.info} />}
            active={method === 'card'}
            onPress={() => setMethod('card')}
          />
          <MethodTile
            label={t('payment.other')}
            icon={<MoreHorizontal size={22} color={theme.colors.text.primary} />}
            active={method === 'other'}
            onPress={() => setMethod('other')}
          />
        </View>

        {method === 'upi' ? (
          <View style={styles.upiRow}>
            <Chip label="GPay" onPress={() => launchUpiApp('gpay')} />
            <Chip label="PhonePe" onPress={() => launchUpiApp('phonepe')} />
            <Chip label="Paytm" onPress={() => launchUpiApp('paytm')} />
          </View>
        ) : null}
      </ScrollView>

      <NumPad onDigit={onDigit} onBackspace={onBackspace} />

      <View style={styles.footer}>
        <Button
          label={
            amount > 0 ? t('payment.confirm', { amount: formatINR(amount) }) : t('common.confirm')
          }
          onPress={handleConfirm}
          size="xl"
          disabled={amount <= 0}
        />
      </View>

      <SuccessOverlay
        visible={success}
        title={t('payment.successTitle', { amount: formatINR(amount) })}
        subtitle={t('payment.successFrom', { name: customer.name })}
        primaryActionLabel={t('payment.sendReceipt')}
        onPrimaryAction={() => {
          handleSendReceipt();
          setSuccess(false);
          router.back();
        }}
        secondaryActionLabel={t('payment.doneAction')}
        onSecondaryAction={() => {
          setSuccess(false);
          router.back();
        }}
      />
    </Screen>
  );
}

const MethodTile = ({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}) => {
  const { styles, theme } = useStyles(stylesheet);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.methodTile,
        {
          backgroundColor: active ? theme.colors.brand.glow : theme.colors.bg.surface,
          borderColor: active ? theme.colors.brand.primary : theme.colors.border.subtle,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      {icon}
      <Text variant="caption" weight={active ? 'semibold' : 'regular'} style={{ marginTop: 6 }}>
        {label}
      </Text>
    </Pressable>
  );
};

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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.bg.surface,
    marginHorizontal: theme.spacing.base,
    marginTop: theme.spacing.md,
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  remainingRow: { alignItems: 'center', marginTop: theme.spacing.sm },
  collectFullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.base,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.base,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    marginTop: theme.spacing.lg,
  },
  methodTile: {
    flexBasis: '23%',
    flexGrow: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: theme.radius.base,
  },
  upiRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.md,
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
