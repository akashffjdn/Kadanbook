import { Button, IconButton, Input, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { formatPhoneDisplay, isValidIndianMobile, normalizePhone, stripPhone } from '@/utils/phone';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, ChevronDown, Phone } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from '@/lib/keyboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

/**
 * Change phone number flow.
 *
 * Design refs:
 *  - WhatsApp change number (warning banner + before/after comparison)
 *  - Telegram (clean phone entry mirrors login)
 *  - Apple ID change (cautionary callout up top)
 */
export default function ChangeNumberRoute() {
  const router = useRouter();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);

  const [raw, setRaw] = useState('');
  const valid = useMemo(() => isValidIndianMobile(raw), [raw]);

  const handleNext = () => {
    if (!valid) return;
    const phone = normalizePhone(raw);
    toast.success('OTP sent to your new number');
    router.push({ pathname: '/(auth)/otp', params: { phone } });
  };

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 4 }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<ArrowLeft size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
        />
        <Text variant="subtitle" weight="semibold">
          Change Number
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={32}
        contentContainerStyle={{ padding: theme.spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningBox}>
          <Text variant="body" weight="semibold" color="warning">
            Heads up
          </Text>
          <Text variant="caption" color="secondary" style={{ marginTop: 4, lineHeight: 18 }}>
            Your data stays with you. Customers and transactions move with your account to the new
            number after you verify with OTP.
          </Text>
        </View>

        <View style={{ marginTop: theme.spacing.xl }}>
          <Text variant="label" color="secondary">
            CURRENT NUMBER
          </Text>
          <Text variant="bodyLarge" weight="semibold" style={{ marginTop: 4 }}>
            +91 {profile?.phone.replace('+91', '') ?? '—'}
          </Text>
        </View>

        <View style={{ marginTop: theme.spacing.xl }}>
          <Text variant="label" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            NEW NUMBER
          </Text>
          <View style={styles.phoneRow}>
            <Pressable style={styles.country} hitSlop={8}>
              <Text style={{ fontSize: 22 }}>🇮🇳</Text>
              <Text variant="bodyLarge" weight="semibold">
                +91
              </Text>
              <ChevronDown size={16} color={theme.colors.text.secondary} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Input
                value={formatPhoneDisplay(raw)}
                onChangeText={(v) => setRaw(stripPhone(v).slice(0, 10))}
                placeholder="98765 43210"
                keyboardType="phone-pad"
                autoFocus
                showLabel={false}
                maxLength={12}
                leftIcon={<Phone size={20} color={theme.colors.text.secondary} />}
              />
            </View>
          </View>
        </View>

        <View style={{ marginTop: theme.spacing['2xl'] }}>
          <Button
            label="Send OTP to new number"
            disabled={!valid}
            onPress={handleNext}
            size="xl"
            rightIcon={<ArrowRight size={20} color={theme.colors.text.onBrand} />}
          />
        </View>
      </KeyboardAwareScrollView>
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
  warningBox: {
    backgroundColor: theme.colors.semantic.warningBg,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    borderWidth: 1,
    borderColor: theme.colors.status.pending,
    marginTop: theme.spacing.md,
  },
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
}));
