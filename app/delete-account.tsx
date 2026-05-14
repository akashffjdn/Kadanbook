import { Button, IconButton, Input, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { useDataStore } from '@/store/data.store';
import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, Check, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { toast } from 'sonner-native';

/**
 * Delete account confirmation flow.
 *
 * Design refs:
 *  - WhatsApp delete account (multi-step confirm, reason chips, danger CTA)
 *  - Notion account deletion (final confirmation typed phrase)
 *  - Apple ID account delete (clear consequences list)
 */
const REASONS = [
  'Switched to another app',
  "Don't need it anymore",
  'Missing features',
  'Too complicated',
  'Privacy concerns',
  'Other',
];

const CONFIRM_PHRASE = 'DELETE';

export default function DeleteAccountRoute() {
  const router = useRouter();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<string | null>(null);
  const [phrase, setPhrase] = useState('');
  const logout = useAuthStore((s) => s.logout);

  const handleDelete = () => {
    if (phrase.trim().toUpperCase() !== CONFIRM_PHRASE) {
      toast.error(`Type ${CONFIRM_PHRASE} to confirm`);
      return;
    }
    // Wipe everything (in prod: call API too).
    useDataStore.persist?.clearStorage?.();
    logout();
    toast.success('Account deleted');
    router.replace('/(auth)/login');
  };

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 4 }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<ArrowLeft size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
        />
        <Text variant="subtitle" weight="semibold">
          Delete Account
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 60 + insets.bottom }}
      >
        <View style={styles.warnHero}>
          <View style={styles.warnIcon}>
            <AlertTriangle size={32} color={theme.colors.semantic.danger} />
          </View>
          <Text
            variant="title"
            weight="bold"
            align="center"
            style={{ marginTop: theme.spacing.md, fontSize: 22 }}
          >
            This cannot be undone
          </Text>
          <Text
            variant="body"
            color="secondary"
            align="center"
            style={{ marginTop: theme.spacing.sm, lineHeight: 22 }}
          >
            All your customers, transactions, and reminders will be permanently deleted.
          </Text>
        </View>

        <Text variant="label" color="secondary" style={{ marginTop: theme.spacing.xl }}>
          WHY ARE YOU LEAVING?
        </Text>
        <View style={styles.reasons}>
          {REASONS.map((r) => {
            const sel = reason === r;
            return (
              <Pressable
                key={r}
                onPress={() => setReason(r)}
                style={({ pressed }) => [
                  styles.reasonRow,
                  {
                    borderColor: sel ? theme.colors.brand.primary : theme.colors.border.subtle,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text variant="body" weight={sel ? 'semibold' : 'regular'} style={{ flex: 1 }}>
                  {r}
                </Text>
                {sel ? <Check size={18} color={theme.colors.brand.primary} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text variant="label" color="secondary" style={{ marginTop: theme.spacing.xl }}>
          TYPE "{CONFIRM_PHRASE}" TO CONFIRM
        </Text>
        <View style={{ marginTop: theme.spacing.sm }}>
          <Input
            value={phrase}
            onChangeText={setPhrase}
            placeholder={CONFIRM_PHRASE}
            autoCapitalize="characters"
            autoCorrect={false}
            showLabel={false}
          />
        </View>

        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.sm }}>
          <Button
            label="Delete account permanently"
            onPress={handleDelete}
            variant="danger"
            size="xl"
            leftIcon={<Trash2 size={18} color={theme.colors.text.onBrand} />}
          />
          <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
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
  warnHero: { alignItems: 'center', paddingVertical: theme.spacing.lg },
  warnIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.semantic.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasons: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1,
    borderRadius: theme.radius.base,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
  },
}));
