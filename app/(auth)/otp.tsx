import { Header, OTPInput, type OTPInputHandle, Screen, Text } from '@/components/ui';
import { useHaptic } from '@/hooks/useHaptic';
import { useAuthStore } from '@/store/auth.store';
import { displayNationalPhone } from '@/utils/phone';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from '@/lib/keyboard';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

/**
 * OTP verification screen.
 * Design refs:
 *  - Apple Pay (6-cell auto-advance with auto-paste detection)
 *  - Stripe Checkout (success → green fill cascade)
 *  - Linear sign-in (countdown timer with active orange resend)
 *
 * UX rules: dev mode accepts "123456" instantly. Wrong → shake + red flash.
 * Right → green sequential fill, haptic success, then auto-route to /(tabs).
 */
const VALID_OTP = '123456';
const RESEND_SECONDS = 45;

export default function OtpRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone ?? '';
  const trigger = useHaptic();
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const otpRef = useRef<OTPInputHandle>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const handleComplete = useCallback(
    (entered: string) => {
      if (entered === VALID_OTP) {
        trigger('success');
        setError(false);
        setSuccess(true);
        // Simulate token receipt.
        setTimeout(() => {
          setSession({
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            phone,
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          });
          setProfile({
            shopName: 'Rajan Tea Stall',
            ownerName: 'Rajan Murugan',
            phone,
            reminderTemplate:
              'வணக்கம் {name}, உங்கள் கடன் தொகை ₹{amount} கொடுக்க மறவாதீர்கள். நன்றி - {shop_name}',
            defaultDueDays: 7,
          });
          router.replace('/(tabs)');
        }, 600);
      } else {
        trigger('error');
        setError(true);
        otpRef.current?.shake();
        setTimeout(() => {
          otpRef.current?.clear();
          setError(false);
        }, 1000);
        toast.error(t('auth.wrongCode'));
      }
    },
    [phone, router, setSession, setProfile, trigger, t],
  );

  const handleResend = useCallback(() => {
    if (secondsLeft > 0) return;
    trigger('light');
    setSecondsLeft(RESEND_SECONDS);
    toast.success(`OTP ${t('auth.resendNow').toLowerCase()}`);
  }, [secondsLeft, trigger, t]);

  return (
    <Screen edges={{ top: true, bottom: true }}>
      <Header onBack={() => router.back()} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: theme.spacing.lg }}
        bottomOffset={32}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.title}>{t('auth.otpTitle')}</Text>
          <Text variant="bodyLarge" color="secondary" style={styles.subtitle}>
            {t('auth.otpSubtitle', { phone: `+91 ${displayNationalPhone(phone)}` })}
          </Text>
        </View>

        <View style={styles.otpWrap}>
          <OTPInput
            ref={otpRef}
            length={6}
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            error={error}
            success={success}
            autoFocus
          />
        </View>

        <View style={styles.resendRow}>
          {secondsLeft > 0 ? (
            <Text variant="body" color="muted">
              {t('auth.resendIn', { seconds: secondsLeft })}
            </Text>
          ) : (
            <Pressable onPress={handleResend} hitSlop={8}>
              <Text variant="body" weight="semibold" color="brand">
                {t('auth.resendNow')}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.hint}>
          <Text variant="caption" color="muted" align="center">
            Dev OTP: 123456
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  hero: { marginTop: theme.spacing.lg, marginBottom: theme.spacing['2xl'] },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: { marginTop: theme.spacing.sm, maxWidth: 320 },
  otpWrap: { paddingVertical: theme.spacing.lg },
  resendRow: { alignItems: 'center', paddingTop: theme.spacing.xl },
  hint: { paddingBottom: theme.spacing.lg },
}));
