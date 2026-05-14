import { IconButton, ListRow, Screen, Text } from '@/components/ui';
import { env } from '@/constants/env';
import { useRouter } from 'expo-router';
import { ArrowLeft, Github, Globe, Heart, Mail, Wallet } from 'lucide-react-native';
import { Linking, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

/**
 * About.
 *
 * Design refs:
 *  - GitHub mobile about (versioned, credit, links)
 *  - Notion about (warm, brand-forward identity)
 *  - Apple "About this device" (clean rows)
 */
export default function AboutRoute() {
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
          About
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 60 + insets.bottom }}
      >
        <View style={styles.brandBox}>
          <View style={styles.logoBox}>
            <Wallet size={36} color={theme.colors.text.onBrand} />
          </View>
          <Text variant="title" weight="bold" style={{ marginTop: theme.spacing.md, fontSize: 24 }}>
            KadanBook
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: 4 }}>
            v{env.APP_VERSION}
          </Text>
        </View>

        <View style={styles.section}>
          <ListRow
            title="Website"
            subtitle="kadanbook.com"
            leftIcon={<Globe size={20} color={theme.colors.brand.primary} />}
            onPress={() => Linking.openURL('https://kadanbook.com')}
            showChevron
          />
          <Divider />
          <ListRow
            title="Contact"
            subtitle="hello@kadanbook.com"
            leftIcon={<Mail size={20} color={theme.colors.semantic.info} />}
            onPress={() => Linking.openURL('mailto:hello@kadanbook.com')}
            showChevron
          />
          <Divider />
          <ListRow
            title="Open source"
            subtitle="github.com/kadanbook"
            leftIcon={<Github size={20} color={theme.colors.text.primary} />}
            onPress={() => Linking.openURL('https://github.com')}
            showChevron
          />
        </View>

        <View style={styles.foot}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Text variant="caption" color="muted">
              Made with
            </Text>
            <Heart
              size={14}
              color={theme.colors.semantic.danger}
              fill={theme.colors.semantic.danger}
            />
            <Text variant="caption" color="muted">
              in Chennai
            </Text>
          </View>
          <Text
            variant="caption"
            color="muted"
            align="center"
            style={{ marginTop: theme.spacing.sm }}
          >
            © 2026 KadanBook. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const Divider = () => {
  const { styles } = useStyles(stylesheet);
  return <View style={styles.divider} />;
};

const stylesheet = createStyleSheet((theme) => ({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  brandBox: { alignItems: 'center', paddingVertical: theme.spacing.xl },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: theme.colors.border.subtle, marginLeft: 56 },
  foot: { marginTop: theme.spacing['3xl'], paddingBottom: theme.spacing['2xl'] },
}));
