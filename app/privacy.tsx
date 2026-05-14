import { IconButton, Screen, Text } from '@/components/ui';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Database,
  Eye,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * In-app Privacy Policy.
 *
 * Design refs:
 *  - Apple "Privacy & Security" page (icon-prefixed sections, scannable)
 *  - Signal privacy page (plain language, short paragraphs)
 *  - Notion legal pages (clear hierarchy with section headers)
 *
 * Plain-language layout (not a wall of legalese): each major topic gets its
 * own card with an icon and a 1-3 sentence explanation. The intent is for a
 * Tamil-Nadu shop owner to actually read and understand it.
 */

interface PrivacySection {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  body: string;
}

const SECTIONS: PrivacySection[] = [
  {
    icon: Smartphone,
    title: 'Your data lives on your phone',
    body:
      'KadanBook stores customers, kadan entries, and payments locally on your device. ' +
      'We do not upload them to any server unless you choose to back up.',
  },
  {
    icon: Lock,
    title: 'No selling, no sharing',
    body:
      'We never sell your data, your customers’ data, or your transactions. ' +
      'We never share them with advertisers or third parties.',
  },
  {
    icon: Eye,
    title: 'What we collect',
    body:
      'Just your mobile number for sign-in (so you can recover your account) and ' +
      'optional shop details you enter yourself. That is it.',
  },
  {
    icon: Database,
    title: 'Backups are yours',
    body:
      'When you tap "Backup data", a JSON file is created on your phone and shared ' +
      'where you choose (Drive, WhatsApp, email). KadanBook never sees the file.',
  },
  {
    icon: ShieldCheck,
    title: 'You can leave anytime',
    body:
      'Use "Delete Account" to wipe everything from your phone. Once deleted, ' +
      'we cannot recover any of it — keep a backup if you want it later.',
  },
  {
    icon: Mail,
    title: 'Questions?',
    body:
      'Email privacy@kadanbook.com or use Help & Support inside the app. ' +
      'We answer within 48 hours.',
  },
];

export default function PrivacyRoute() {
  const router = useRouter();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 4 }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<ArrowLeft size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
        />
        <Text variant="subtitle" weight="semibold">
          Privacy Policy
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: 40 + insets.bottom,
          gap: theme.spacing.md,
        }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Shield size={32} color={theme.colors.brand.primary} strokeWidth={2} />
          </View>
          <Text variant="title" weight="bold" align="center" style={{ marginTop: 12, fontSize: 22 }}>
            Your data, your control
          </Text>
          <Text
            variant="body"
            color="secondary"
            align="center"
            style={{ marginTop: 8, maxWidth: 320, lineHeight: 22 }}
          >
            KadanBook is built so you stay the owner of every customer record, every kadan
            entry, and every paisa. Here is what that means in plain words.
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <View key={s.title} style={styles.card}>
              <View style={styles.cardIcon}>
                <Icon size={20} color={theme.colors.brand.primary} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyLarge" weight="semibold">
                  {s.title}
                </Text>
                <Text variant="body" color="secondary" style={styles.cardBody}>
                  {s.body}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="caption" color="muted" align="center">
            Last updated: 14 May 2026
          </Text>
          <Text variant="caption" color="muted" align="center" style={{ marginTop: 4 }}>
            Version 1.0
          </Text>
        </View>
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
  hero: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.brand.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.brand.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    marginTop: 4,
    lineHeight: 20,
  },
  footer: {
    paddingTop: theme.spacing['2xl'],
    paddingBottom: theme.spacing.lg,
  },
}));
