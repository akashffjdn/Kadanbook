import { Sheet, type SheetRef, Text } from '@/components/ui';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { useSettingsStore } from '@/store/settings.store';
import { Check } from 'lucide-react-native';
import { forwardRef, memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { toast } from 'sonner-native';

/**
 * Default Due Date setting sheet.
 *
 * Design refs:
 *  - Apple Reminders custom-due picker (chip selector for common values)
 *  - iOS Settings → Auto-Lock (radio rows with checkmark)
 */
const PRESETS: Array<{ label: string; days: number; hint?: string }> = [
  { label: 'Same day', days: 0, hint: 'Pay back today' },
  { label: '3 days', days: 3 },
  { label: '7 days', days: 7, hint: 'Most common' },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30, hint: 'Monthly settlement' },
];

export const DueDateSheet = memo(
  forwardRef<SheetRef>((_props, ref) => {
    const { styles, theme } = useStyles(stylesheet);
    const value = useSettingsStore((s) => s.defaultDueDays);
    const setValue = useSettingsStore((s) => s.setDefaultDueDays);

    const handleSelect = useCallback(
      (days: number) => {
        setValue(days);
        toast.success(`Default set to ${days === 0 ? 'same day' : `${days} days`}`);
        (ref as React.RefObject<SheetRef>)?.current?.close();
      },
      [setValue, ref],
    );

    return (
      <Sheet
        ref={ref}
        snapPoints={['55%']}
        title="Default due date"
        subtitle="When new kadan should be paid back"
      >
        {PRESETS.map((p) => {
          const active = value === p.days;
          return (
            <Pressable
              key={p.days}
              onPress={() => handleSelect(p.days)}
              style={({ pressed }) => [
                styles.row,
                {
                  borderColor: active ? theme.colors.brand.primary : theme.colors.border.subtle,
                  backgroundColor: active
                    ? theme.colors.brand.glow
                    : theme.colors.bg.surface,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyLarge" weight={active ? 'semibold' : 'regular'}>
                  {p.label}
                </Text>
                {p.hint ? (
                  <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                    {p.hint}
                  </Text>
                ) : null}
              </View>
              {active ? (
                <View style={[styles.check, { backgroundColor: theme.colors.brand.primary }]}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </Sheet>
    );
  }),
);
DueDateSheet.displayName = 'DueDateSheet';

const stylesheet = createStyleSheet((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.radius.base,
    borderWidth: 1,
    minHeight: 56,
    marginBottom: theme.spacing.sm,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
