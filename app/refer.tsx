import { Button, IconButton, Screen, Text } from '@/components/ui';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Copy, Gift, Share2 } from 'lucide-react-native';
import { Pressable, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

/**
 * Refer & Earn.
 *
 * Design refs:
 *  - Razorpay rewards (gradient hero + copy code box + share CTA)
 *  - Cash App $ rewards (referral chain with checkmarks)
 *  - Dropbox referral (clear "you give + you get" structure)
 */
const STEPS = [
  'Share your referral code with a shop owner friend',
  'They sign up and add 5 customers',
  'You both get 1 month of Pro free',
];

const REF_CODE = 'KADANXX42';

export default function ReferRoute() {
  const router = useRouter();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const copy = async () => {
    await Clipboard.setStringAsync(REF_CODE);
    toast.success('Code copied');
  };

  const share = async () => {
    try {
      await Share.share({
        message: `I'm using KadanBook to manage my shop's credit. Use my code ${REF_CODE} when you sign up — we both get a free month of Pro! Download: https://kadanbook.app`,
      });
    } catch {
      toast.error('Could not share');
    }
  };

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 4 }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<ArrowLeft size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
        />
        <Text variant="subtitle" weight="semibold">
          Refer & Earn
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <View style={styles.hero}>
          <View style={styles.giftWrap}>
            <Gift size={36} color={theme.colors.text.onBrand} />
          </View>
          <Text
            variant="title"
            weight="bold"
            style={{ fontSize: 28, marginTop: theme.spacing.lg }}
            align="center"
          >
            Give 1 month, Get 1 month
          </Text>
          <Text
            variant="bodyLarge"
            color="secondary"
            align="center"
            style={{ marginTop: theme.spacing.sm, maxWidth: 320 }}
          >
            Refer fellow shop owners and unlock Pro for both of you.
          </Text>
        </View>

        <View style={styles.codeBox}>
          <View style={{ flex: 1 }}>
            <Text variant="label" color="secondary">
              YOUR REFERRAL CODE
            </Text>
            <Text
              variant="title"
              weight="bold"
              style={{ fontSize: 24, marginTop: 4, letterSpacing: 2 }}
            >
              {REF_CODE}
            </Text>
          </View>
          <Pressable
            onPress={copy}
            hitSlop={8}
            style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.7 }]}
          >
            <Copy size={18} color={theme.colors.brand.primary} />
          </Pressable>
        </View>

        <View style={styles.stepsList}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepCircle}>
                <Text variant="body" weight="bold" color="onBrand">
                  {i + 1}
                </Text>
              </View>
              <Text variant="body" style={{ flex: 1 }}>
                {s}
              </Text>
              <Check size={18} color={theme.colors.semantic.success} />
            </View>
          ))}
        </View>

        <View style={{ marginTop: 'auto', paddingBottom: insets.bottom }}>
          <Button
            label="Share with friends"
            onPress={share}
            size="xl"
            leftIcon={<Share2 size={20} color={theme.colors.text.onBrand} />}
          />
        </View>
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
  },
  hero: { alignItems: 'center', paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.xl },
  giftWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.brand.primary,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    marginTop: theme.spacing.lg,
  },
  copyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.glow,
  },
  stepsList: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.bg.surface,
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
