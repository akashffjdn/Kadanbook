import { Button, IconButton, Input, Screen, Text } from '@/components/ui';
import { useHaptic } from '@/hooks/useHaptic';
import { useDataStore } from '@/store/data.store';
import {
  displayNationalPhone,
  formatPhoneDisplay,
  isValidIndianMobile,
  normalizePhone,
  stripPhone,
} from '@/utils/phone';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mail, MapPin, NotebookPen, Phone, User, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from '@/lib/keyboard';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

/**
 * Add / Edit Customer.
 *
 * Design refs:
 *  - Notion forms (clean, breathing room, floating labels)
 *  - Apple Contacts (familiar field order: name → phone → optional)
 *  - Linear new-issue modal (sticky save CTA, X close, distinct from full screen)
 *
 * Presented as `presentation: 'modal'` from root stack.
 */
export default function CustomerNewRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const trigger = useHaptic();
  const params = useLocalSearchParams<{ editId?: string }>();
  const editing = !!params.editId;

  const customers = useDataStore((s) => s.customers);
  const addCustomer = useDataStore((s) => s.addCustomer);
  const updateCustomer = useDataStore((s) => s.updateCustomer);

  const existing = useMemo(
    () => (editing ? customers.find((c) => c.id === params.editId) : undefined),
    [customers, editing, params.editId],
  );

  const [name, setName] = useState(existing?.name ?? '');
  const [phoneRaw, setPhoneRaw] = useState(
    existing ? displayNationalPhone(existing.phone).replace(/\s/g, '') : '',
  );
  const [email, setEmail] = useState(existing?.email ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setPhoneRaw(displayNationalPhone(existing.phone).replace(/\s/g, ''));
      setEmail(existing.email ?? '');
      setAddress(existing.address ?? '');
      setNotes(existing.notes ?? '');
    }
  }, [existing]);

  const validate = useCallback(() => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!isValidIndianMobile(phoneRaw)) e.phone = 'Enter a valid 10-digit mobile';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, phoneRaw]);

  const handleSave = useCallback(() => {
    if (!validate()) {
      trigger('error');
      return;
    }
    trigger('success');
    const payload = {
      name: name.trim(),
      phone: normalizePhone(phoneRaw),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (editing && existing) {
      updateCustomer(existing.id, payload);
      toast.success('Customer updated');
    } else {
      const c = addCustomer(payload);
      toast.success('Customer added');
      router.replace(`/customer/${c.id}` as any);
      return;
    }
    router.back();
  }, [
    validate,
    trigger,
    name,
    phoneRaw,
    email,
    address,
    notes,
    editing,
    existing,
    updateCustomer,
    addCustomer,
    router,
  ]);

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<X size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
          accessibilityLabel="Close"
        />
        <Text variant="subtitle" weight="semibold">
          {editing ? t('customer.editCustomer') : t('customer.newCustomer')}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={120}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.base }}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label={t('customer.name')}
          required
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
          }}
          autoCapitalize="words"
          error={errors.name}
          leftIcon={<User size={20} color={theme.colors.text.secondary} />}
        />

        <Input
          label={t('customer.phone')}
          required
          value={formatPhoneDisplay(phoneRaw)}
          onChangeText={(v) => {
            setPhoneRaw(stripPhone(v).slice(0, 10));
            if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
          }}
          keyboardType="phone-pad"
          maxLength={12}
          error={errors.phone}
          leftIcon={<Phone size={20} color={theme.colors.text.secondary} />}
        />

        <Input
          label={t('customer.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<Mail size={20} color={theme.colors.text.secondary} />}
        />

        <Input
          label={t('customer.address')}
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          leftIcon={<MapPin size={20} color={theme.colors.text.secondary} />}
        />

        <Input
          label={t('customer.notes')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
          leftIcon={<NotebookPen size={20} color={theme.colors.text.secondary} />}
        />
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <Button label={t('common.save')} onPress={handleSave} size="xl" />
      </View>
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
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.bg.base,
  },
}));
