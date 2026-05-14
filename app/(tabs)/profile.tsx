import { Avatar, ListRow, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { useDataStore } from '@/store/data.store';
import { displayNationalPhone } from '@/utils/phone';
import { useRouter } from 'expo-router';
import {
  HelpCircle,
  Info,
  LogOut,
  Settings as SettingsIcon,
  Share2,
} from 'lucide-react-native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

/**
 * Profile / Me tab.
 *
 * Design refs:
 *  - CRED profile (stats hero, member-status badge, premium feel)
 *  - Apple ID (grouped settings list with right-aligned chevrons)
 *  - Linear settings (clean section dividers)
 */
export default function ProfileRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const customers = useDataStore((s) => s.customers);
  const transactions = useDataStore((s) => s.transactions);

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/(auth)/login');
  }, [logout, router]);

  const daysActive = session
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - (session.expiresAt - 30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000),
        ),
      )
    : 0;

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Avatar name={profile?.shopName ?? 'KadanBook'} size="xl" />
          <Text variant="title" weight="bold" style={{ marginTop: theme.spacing.md, fontSize: 22 }}>
            {profile?.shopName ?? 'KadanBook'}
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: 2 }}>
            {profile?.ownerName} · +91 {profile ? displayNationalPhone(profile.phone) : '—'}
          </Text>

        </View>

        {/* Stat row */}
        <View style={styles.statsRow}>
          <Stat label={t('profile.stats.customers')} value={customers.length} />
          <View style={styles.statDivider} />
          <Stat label={t('profile.stats.transactions')} value={transactions.length} />
          <View style={styles.statDivider} />
          <Stat label={t('profile.stats.days')} value={daysActive} />
        </View>

        {/* Settings list */}
        <View style={styles.list}>
          <ListRow
            title={t('profile.settings')}
            leftIcon={<SettingsIcon size={20} color={theme.colors.text.primary} />}
            onPress={() => router.push('/settings')}
            showChevron
          />
          <Divider />
          <ListRow
            title={t('profile.refer')}
            leftIcon={<Share2 size={20} color={theme.colors.semantic.info} />}
            onPress={() => router.push('/refer')}
            showChevron
          />
          <Divider />
          <ListRow
            title={t('profile.help')}
            leftIcon={<HelpCircle size={20} color={theme.colors.text.primary} />}
            onPress={() => router.push('/help')}
            showChevron
          />
          <Divider />
          <ListRow
            title={t('profile.about')}
            leftIcon={<Info size={20} color={theme.colors.text.primary} />}
            onPress={() => router.push('/about')}
            showChevron
          />
        </View>

        <View style={styles.list}>
          <ListRow
            title={t('auth.logout')}
            leftIcon={<LogOut size={20} color={theme.colors.semantic.danger} />}
            onPress={handleLogout}
            destructive
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text variant="title" weight="bold" style={{ fontSize: 22 }} numeric>
      {value}
    </Text>
    <Text variant="caption" color="secondary">
      {label}
    </Text>
  </View>
);

const Divider = () => {
  const { styles } = useStyles(stylesheet);
  return <View style={styles.divider} />;
};

const stylesheet = createStyleSheet((theme) => ({
  hero: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bg.surface,
    marginHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  statDivider: { width: 1, height: 32, backgroundColor: theme.colors.border.subtle },
  list: {
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.base,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: theme.colors.border.subtle, marginLeft: 56 },
}));
