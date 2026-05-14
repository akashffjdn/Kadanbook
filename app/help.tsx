import { IconButton, Screen, Text } from '@/components/ui';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

/**
 * Help / FAQ.
 *
 * Design refs:
 *  - Linear help center (clean accordion)
 *  - Notion FAQ
 *  - Stripe support (large contact tiles below FAQ)
 */
const FAQ = [
  {
    q: 'How do I add a customer?',
    a: 'Go to the Customers tab and tap the orange + button. Enter name and 10-digit mobile number.',
  },
  {
    q: 'Will my customers see this app?',
    a: 'No. Only you see KadanBook. Reminders go via your WhatsApp, so they only see a normal message from you.',
  },
  {
    q: 'Is my data safe if I lose my phone?',
    a: 'Pro plan auto-backs up to your Google Drive daily. Free plan stores data only on your device.',
  },
  {
    q: 'Can I use this app without internet?',
    a: 'Yes. Adding kadan, payments, and viewing customers all work offline. Internet is only needed for WhatsApp reminders and UPI.',
  },
  {
    q: 'How do I send reminders in Tamil?',
    a: 'The default template is already in Tamil. Go to Settings → Reminder Template to customize.',
  },
  {
    q: 'How do I record a partial payment?',
    a: 'On Collect Payment screen, enter only the amount received. The remaining balance updates automatically.',
  },
];

export default function HelpRoute() {
  const router = useRouter();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 4 }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<ArrowLeft size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
        />
        <Text variant="subtitle" weight="semibold">
          Help & Support
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 60 + insets.bottom }}
      >
        <Text variant="title" weight="bold" style={{ fontSize: 24 }}>
          How can we help?
        </Text>

        <View style={styles.faqList}>
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <Animated.View
                key={i}
                layout={LinearTransition.duration(220)}
                entering={FadeInDown.duration(220).delay(i * 40)}
                style={styles.faqItem}
              >
                <Pressable
                  onPress={() => setOpen(isOpen ? null : i)}
                  style={({ pressed }) => [styles.faqQ, pressed && { opacity: 0.7 }]}
                >
                  <Text variant="body" weight="semibold" style={{ flex: 1 }}>
                    {item.q}
                  </Text>
                  <Animated.View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
                    <ChevronDown size={18} color={theme.colors.text.secondary} />
                  </Animated.View>
                </Pressable>
                {isOpen ? (
                  <Animated.View entering={FadeInDown.duration(240)}>
                    <Text variant="body" color="secondary" style={styles.faqA}>
                      {item.a}
                    </Text>
                  </Animated.View>
                ) : null}
              </Animated.View>
            );
          })}
        </View>

        <Text variant="subtitle" weight="semibold" style={{ marginTop: theme.spacing['2xl'] }}>
          Still need help?
        </Text>

        <View style={styles.contactGrid}>
          <ContactTile
            icon={<MessageCircle size={22} color={theme.colors.semantic.success} />}
            label="WhatsApp"
            sub="9am – 9pm"
            onPress={() => Linking.openURL('https://wa.me/919000000000')}
          />
          <ContactTile
            icon={<Mail size={22} color={theme.colors.semantic.info} />}
            label="Email"
            sub="help@kadanbook.com"
            onPress={() => Linking.openURL('mailto:help@kadanbook.com')}
          />
          <ContactTile
            icon={<Phone size={22} color={theme.colors.brand.primary} />}
            label="Call"
            sub="+91 90000 00000"
            onPress={() => Linking.openURL('tel:+919000000000')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const ContactTile = ({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onPress: () => void;
}) => {
  const { styles } = useStyles(stylesheet);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.contactTile, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.contactIcon}>{icon}</View>
      <Text variant="body" weight="semibold" style={{ marginTop: 8 }}>
        {label}
      </Text>
      <Text variant="caption" color="secondary">
        {sub}
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
  },
  faqList: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  faqItem: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  faqQ: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  faqA: { marginTop: theme.spacing.sm, lineHeight: 22 },
  contactGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  contactTile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
