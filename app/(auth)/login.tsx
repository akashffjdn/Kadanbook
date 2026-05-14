import { Button, Input, Screen, Text } from '@/components/ui';
import { useHaptic } from '@/hooks/useHaptic';
import { formatPhoneDisplay, isValidIndianMobile, normalizePhone, stripPhone } from '@/utils/phone';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronDown, Phone } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from '@/lib/keyboard';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

/**
 * Login screen.
 * Design refs:
 *  - Revolut (oversized greeting, single-field clarity)
 *  - Cash App (CTA color interpolates as input becomes valid)
 *  - Linear (terms link in muted footer)
 *
 * Layout: top greeting, then country prefix + phone input, then send-OTP CTA.
 * Validation: live, button color responds to input validity.
 */
export default function LoginRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const trigger = useHaptic();
  const [raw, setRaw] = useState('');

  const valid = useMemo(() => isValidIndianMobile(raw), [raw]);

  const handleChange = useCallback((v: string) => {
    setRaw(stripPhone(v).slice(0, 10));
  }, []);

  const handleSend = useCallback(() => {
    if (!valid) return;
    trigger('success');
    const phone = normalizePhone(raw);
    router.push({ pathname: '/(auth)/otp', params: { phone } });
  }, [valid, raw, router, trigger]);

  return (
    <Screen padded edges={{ top: true, bottom: true }}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.greeting}>{t('auth.greeting')}</Text>
          <Text variant="bodyLarge" color="secondary" style={styles.subtitle}>
            {t('auth.loginSubtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.phoneRow}>
            <Pressable style={styles.country} hitSlop={8}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text variant="bodyLarge" weight="semibold">
                +91
              </Text>
              <ChevronDown size={16} color={theme.colors.text.secondary} />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Input
                value={formatPhoneDisplay(raw)}
                onChangeText={handleChange}
                placeholder={t('auth.phonePlaceholder')}
                keyboardType="phone-pad"
                autoFocus
                maxLength={12}
                showLabel={false}
                leftIcon={<Phone size={20} color={theme.colors.text.secondary} />}
              />
            </View>
          </View>

          <View style={{ marginTop: theme.spacing.xl }}>
            <Button
              label={t('auth.sendOtp')}
              onPress={handleSend}
              disabled={!valid}
              size="xl"
              rightIcon={<ArrowRight size={20} color={theme.colors.text.onBrand} />}
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.terms}>
          <Text variant="caption" color="muted" align="center">
            {t('auth.termsPrefix')}{' '}
            <Text variant="caption" color="secondary" weight="semibold">
              {t('auth.terms')}
            </Text>
            {' · '}
            <Text variant="caption" color="secondary" weight="semibold">
              {t('auth.privacy')}
            </Text>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  hero: {
    marginTop: theme.spacing['2xl'],
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    color: theme.colors.text.primary,
  },
  subtitle: { marginTop: theme.spacing.sm, maxWidth: 280 },
  form: {},
  phoneRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'stretch',
  },
  country: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: theme.spacing.base,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.base,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    minHeight: 56,
  },
  flag: { fontSize: 22 },
  terms: {
    paddingBottom: theme.spacing.lg,
  },
}));
