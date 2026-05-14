import { Button, IconButton, Screen, Text } from '@/components/ui';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

/**
 * Reminder Template Editor.
 *
 * Design refs:
 *  - Mailchimp template editor (variables as drag chips, live preview pane)
 *  - WhatsApp Business message template (variable placeholders + preview
 *    rendered with realistic example data)
 *  - Linear command-palette tooltips (chip-style variable selectors)
 *
 * Layout:
 *   Header (back + title + reset)
 *   ┌─ Edit ──────────────────────────┐
 *   │ Multiline TextInput              │
 *   └──────────────────────────────────┘
 *   Variables: [{name}] [{amount}] [{shop_name}]
 *
 *   ┌─ PREVIEW ───────────────────────┐
 *   │ "Hello Murugan, your kadan      │
 *   │  amount ₹2,450 ..."             │
 *   └──────────────────────────────────┘
 *
 *   [Save]
 *
 * Variables are inserted at the current cursor position when tapped.
 */

const VARIABLES = [
  { token: '{name}', label: 'Customer name' },
  { token: '{amount}', label: 'Pending amount' },
  { token: '{shop_name}', label: 'Your shop name' },
] as const;

const DEFAULT_TA =
  'வணக்கம் {name}, உங்கள் கடன் தொகை ₹{amount} கொடுக்க மறவாதீர்கள். நன்றி - {shop_name}';
const DEFAULT_EN =
  'Hi {name}, please remember to pay your pending amount of ₹{amount}. Thanks - {shop_name}';

const SAMPLE = {
  name: 'Murugan',
  amount: '2,450',
  shop_name: 'Rajan Tea Stall',
};

export default function ReminderTemplateRoute() {
  const router = useRouter();
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const stored = useSettingsStore((s) => s.reminderTemplate);
  const setStored = useSettingsStore((s) => s.setReminderTemplate);
  const language = useSettingsStore((s) => s.language);
  const profile = useAuthStore((s) => s.profile);

  const [draft, setDraft] = useState(stored);
  const [selection, setSelection] = useState<{ start: number; end: number }>({
    start: stored.length,
    end: stored.length,
  });

  const preview = useMemo(
    () =>
      draft
        .replaceAll('{name}', SAMPLE.name)
        .replaceAll('{amount}', SAMPLE.amount)
        .replaceAll('{shop_name}', profile?.shopName || SAMPLE.shop_name),
    [draft, profile],
  );

  const insertVariable = useCallback(
    (token: string) => {
      const before = draft.slice(0, selection.start);
      const after = draft.slice(selection.end);
      const next = `${before}${token}${after}`;
      setDraft(next);
      const newPos = before.length + token.length;
      setSelection({ start: newPos, end: newPos });
    },
    [draft, selection],
  );

  const handleReset = useCallback(() => {
    const def = language === 'ta' ? DEFAULT_TA : DEFAULT_EN;
    setDraft(def);
    toast.success('Reset to default');
  }, [language]);

  const handleSave = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      toast.error('Template cannot be empty');
      return;
    }
    setStored(trimmed);
    toast.success('Template saved');
    router.back();
  }, [draft, setStored, router]);

  const charCount = draft.length;
  const overLimit = charCount > 320;

  return (
    <Screen edges={{ top: false, bottom: false }} style={{ paddingTop: insets.top + 4 }}>
      <View style={styles.headerRow}>
        <IconButton
          icon={<ArrowLeft size={22} color={theme.colors.text.primary} />}
          onPress={() => router.back()}
        />
        <Text variant="subtitle" weight="semibold">
          Reminder Template
        </Text>
        <IconButton
          icon={<RefreshCw size={18} color={theme.colors.text.primary} />}
          onPress={handleReset}
          variant="tinted"
          accessibilityLabel="Reset to default"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: 120 + insets.bottom,
          gap: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Editor */}
        <View>
          <Text variant="label" color="secondary" style={styles.sectionLabel}>
            EDIT MESSAGE
          </Text>
          <View style={[styles.editor, { borderColor: theme.colors.border.subtle }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              multiline
              autoFocus
              style={[
                styles.input,
                { color: theme.colors.text.primary },
              ]}
              placeholder="Type your reminder message…"
              placeholderTextColor={theme.colors.text.muted}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.charRow}>
            <Text variant="caption" color="muted">
              Tip: tap a variable below to insert it at the cursor.
            </Text>
            <Text
              variant="caption"
              color={overLimit ? 'danger' : 'muted'}
              numeric
            >
              {charCount} / 320
            </Text>
          </View>
        </View>

        {/* Variables */}
        <View>
          <Text variant="label" color="secondary" style={styles.sectionLabel}>
            VARIABLES
          </Text>
          <View style={styles.varRow}>
            {VARIABLES.map((v) => (
              <Pressable
                key={v.token}
                onPress={() => insertVariable(v.token)}
                style={({ pressed }) => [
                  styles.varChip,
                  {
                    borderColor: theme.colors.border.subtle,
                    backgroundColor: theme.colors.bg.surface,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  variant="body"
                  weight="semibold"
                  style={{ color: theme.colors.brand.primary }}
                  numeric
                >
                  {v.token}
                </Text>
                <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                  {v.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Live preview */}
        <View>
          <Text variant="label" color="secondary" style={styles.sectionLabel}>
            PREVIEW
          </Text>
          <View
            style={[
              styles.previewBubble,
              { backgroundColor: theme.colors.semantic.successBg },
            ]}
          >
            <Text variant="bodyLarge" style={{ lineHeight: 24 }}>
              {preview}
            </Text>
          </View>
          <Text variant="caption" color="muted" align="center" style={{ marginTop: 8 }}>
            How customers will see it on WhatsApp
          </Text>
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <Button label="Save Template" onPress={handleSave} size="xl" disabled={overLimit} />
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
  sectionLabel: { marginBottom: 8, fontSize: 11, letterSpacing: 0.6 },

  editor: {
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1.5,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    minHeight: 140,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    minHeight: 100,
    padding: 0,
  },
  charRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    gap: theme.spacing.md,
  },

  varRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  varChip: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.base,
    borderWidth: 1,
    minHeight: 56,
    flexBasis: '31%',
    flexGrow: 1,
  },

  previewBubble: {
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderTopLeftRadius: 4,
    minHeight: 80,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.bg.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
}));
