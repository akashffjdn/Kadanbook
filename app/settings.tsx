import { DueDateSheet } from '@/components/domain/DueDateSheet';
import { ThemePickerSheet } from '@/components/domain/ThemePickerSheet';
import { UpiIdSheet } from '@/components/domain/UpiIdSheet';
import { IconButton, ListRow, Screen, type SheetRef, Switch, Text } from '@/components/ui';
import { env } from '@/constants/env';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { useSettingsStore } from '@/store/settings.store';
import { useThemeStore } from '@/store/theme.store';
import { themeMeta } from '@/theme/palettes';
import { exportAllDataAsJson } from '@/utils/exportData';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CreditCard,
  Database,
  Eye,
  KeyRound,
  Languages,
  Palette,
  Phone,
  Share2,
  Shield,
  Sparkles,
  Trash2,
  Vibrate,
} from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

/**
 * Settings.
 *
 * Design refs:
 *  - iOS Settings (grouped sections with section labels)
 *  - Telegram (clean toggles, big tap targets)
 *  - CRED settings (premium dividers, careful spacing)
 *
 * Highlights the one-variable theme system: Theme row opens a swatch sheet,
 * tap once → entire app re-skins instantly with no reload.
 */
export default function SettingsRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const themeSheet = useRef<SheetRef>(null);
  const upiSheet = useRef<SheetRef>(null);
  const dueDateSheet = useRef<SheetRef>(null);

  const themeMode = useThemeStore((s) => s.mode);
  const settings = useSettingsStore((s) => s);

  const themeLabel = themeMeta.find((m) => m.id === themeMode)?.label ?? themeMode;
  const langLabel = settings.language === 'ta' ? 'தமிழ்' : 'English';
  const dueDateLabel =
    settings.defaultDueDays === 0 ? 'Same day' : `${settings.defaultDueDays} days`;

  const handleExport = useCallback(async () => {
    try {
      const ok = await exportAllDataAsJson();
      if (!ok) toast.error('Sharing is not available on this device');
    } catch (err) {
      toast.error('Export failed');
      console.warn('export error', err);
    }
  }, []);

  const handlePrivacy = useCallback(() => {
    router.push('/privacy');
  }, [router]);

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<ArrowLeft size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
        />
        <Text variant="subtitle" weight="semibold">
          {t('settings.title')}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 + insets.bottom }}
      >
        {/* APPEARANCE */}
        <Section label={t('settings.sectionAppearance')}>
          <ListRow
            title={t('settings.theme')}
            leftIcon={<Palette size={20} color={theme.colors.brand.primary} />}
            rightContent={
              <Text variant="body" color="secondary">
                {themeLabel}
              </Text>
            }
            onPress={() => themeSheet.current?.snapToIndex(0)}
            showChevron
          />
          <Divider />
          <ListRow
            title={t('settings.language')}
            leftIcon={<Languages size={20} color={theme.colors.semantic.info} />}
            rightContent={
              <Text variant="body" color="secondary">
                {langLabel}
              </Text>
            }
            onPress={() => settings.setLanguage(settings.language === 'ta' ? 'en' : 'ta')}
            showChevron
          />
          <Divider />
          <ToggleRow
            title={t('settings.haptic')}
            icon={<Vibrate size={20} color={theme.colors.text.primary} />}
            value={settings.hapticEnabled}
            onChange={settings.setHaptic}
          />
        </Section>

        {/* NOTIFICATIONS */}
        <Section label={t('settings.sectionNotifications')}>
          <ToggleRow
            title={t('settings.notifPayment')}
            icon={<Bell size={20} color={theme.colors.text.primary} />}
            value={settings.notifPaymentAlerts}
            onChange={(v) => settings.setNotif('payment', v)}
          />
          <Divider />
          <ToggleRow
            title={t('settings.notifReminder')}
            icon={<Bell size={20} color={theme.colors.text.primary} />}
            value={settings.notifReminderConfirm}
            onChange={(v) => settings.setNotif('reminder', v)}
          />
          <Divider />
          <ToggleRow
            title={t('settings.notifDaily')}
            icon={<Bell size={20} color={theme.colors.text.primary} />}
            value={settings.notifDailySummary}
            onChange={(v) => settings.setNotif('daily', v)}
          />
        </Section>

        {/* PAYMENTS */}
        <Section label={t('settings.sectionPayments')}>
          <ListRow
            title={t('settings.upiId')}
            leftIcon={<CreditCard size={20} color={theme.colors.text.primary} />}
            rightContent={
              <Text variant="body" color={settings.upiId ? 'primary' : 'secondary'}>
                {settings.upiId || 'Not set'}
              </Text>
            }
            onPress={() => upiSheet.current?.snapToIndex(0)}
            showChevron
          />
          <Divider />
          <ListRow
            title={t('settings.reminderTemplate')}
            leftIcon={<Sparkles size={20} color={theme.colors.brand.primary} />}
            onPress={() => router.push('/settings/reminder-template')}
            showChevron
          />
          <Divider />
          <ListRow
            title={t('settings.defaultDueDate')}
            leftIcon={<Calendar size={20} color={theme.colors.text.primary} />}
            rightContent={
              <Text variant="body" color="secondary">
                {dueDateLabel}
              </Text>
            }
            onPress={() => dueDateSheet.current?.snapToIndex(0)}
            showChevron
          />
        </Section>

        {/* DATA */}
        <Section label={t('settings.sectionData')}>
          <ListRow
            title="Backup data"
            subtitle="Save a copy to Drive, email, or WhatsApp"
            leftIcon={<Share2 size={20} color={theme.colors.semantic.info} />}
            onPress={handleExport}
            showChevron
          />
          <Divider />
          <ListRow
            title={t('settings.exportData')}
            subtitle="JSON file with all customers and transactions"
            leftIcon={<Database size={20} color={theme.colors.text.primary} />}
            onPress={handleExport}
            showChevron
          />
          <Divider />
          <ListRow
            title={t('settings.deleteData')}
            leftIcon={<Trash2 size={20} color={theme.colors.semantic.danger} />}
            onPress={() => router.push('/delete-account')}
            destructive
          />
        </Section>

        {/* ACCOUNT */}
        <Section label={t('settings.sectionAccount')}>
          <ListRow
            title={t('settings.changeNumber')}
            leftIcon={<Phone size={20} color={theme.colors.text.primary} />}
            onPress={() => router.push('/change-number')}
            showChevron
          />
          <Divider />
          <ListRow
            title={t('settings.privacy')}
            leftIcon={<Shield size={20} color={theme.colors.text.primary} />}
            onPress={handlePrivacy}
            showChevron
          />
          <Divider />
          <ListRow
            title="Delete Account"
            leftIcon={<KeyRound size={20} color={theme.colors.semantic.danger} />}
            onPress={() => router.push('/delete-account')}
            destructive
            showChevron
          />
        </Section>

        {/* ABOUT */}
        <Section label={t('settings.sectionAbout')}>
          <ListRow
            title={`${t('settings.version')} ${env.APP_VERSION}`}
            leftIcon={<Eye size={20} color={theme.colors.text.primary} />}
          />
        </Section>

        <View style={styles.foot}>
          <Text variant="caption" color="muted" align="center">
            {t('settings.madeIn')}
          </Text>
        </View>
      </ScrollView>

      <ThemePickerSheet ref={themeSheet} />
      <UpiIdSheet ref={upiSheet} />
      <DueDateSheet ref={dueDateSheet} />
    </Screen>
  );
}

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const { styles } = useStyles(stylesheet);
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text variant="label" color="secondary">
          {label}
        </Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};

const ToggleRow = ({
  title,
  icon,
  value,
  onChange,
}: {
  title: string;
  icon: React.ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <ListRow
    title={title}
    leftIcon={icon}
    rightContent={<Switch value={value} onValueChange={onChange} />}
  />
);

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
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  sectionBody: {
    backgroundColor: theme.colors.bg.surface,
    marginHorizontal: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: theme.colors.border.subtle, marginLeft: 56 },
  foot: { padding: theme.spacing.xl },
}));
